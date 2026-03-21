from __future__ import annotations

import json
import mimetypes
import os
import uuid
from datetime import datetime
from urllib.parse import urlparse

from fastapi import HTTPException
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.company import Company
from app.models.company_recruiter import CompanyRecruiter
from app.models.departments import Department
from app.models.interview_rounds import InterviewRound
from app.models.job_application import JobApplication
from app.models.job_eligibility import JobEligibility
from app.models.job_location import JobLocation
from app.models.job_skills import JobSkill
from app.models.jobs import Job
from app.models.offers import Offer
from app.models.placement_drives import PlacementDrive
from app.models.tpo_coordinator import TPOCoordinator
from app.models.student_document import StudentDocument
from app.models.student_skills import StudentSkill
from app.models.students import Student
from app.models.user import User
from app.core.config import settings
from app.storage import minio_client


class RecruiterService:
    @staticmethod
    async def _get_company_or_404(db: AsyncSession, current_user_id: uuid.UUID) -> Company:
        # Primary path: account owner with COMPANY role mapped directly to Company.user_id.
        row = await db.execute(select(Company).where(Company.user_id == current_user_id))
        company = row.scalar_one_or_none()
        if company:
            return company

        # Fallback path: recruiter sub-account resolved via company_recruiters.email.
        user_row = await db.execute(select(User.email).where(User.id == current_user_id))
        user_email = user_row.scalar_one_or_none()
        if user_email:
            recruiter_row = await db.execute(
                select(Company)
                .join(CompanyRecruiter, CompanyRecruiter.company_id == Company.id)
                .where(func.lower(CompanyRecruiter.email) == user_email.lower())
                .limit(1)
            )
            company = recruiter_row.scalar_one_or_none()
            if company:
                return company

        raise HTTPException(404, "Recruiter company profile not found")

    @staticmethod
    async def _resolve_target_departments(db: AsyncSession, requested_department_id: uuid.UUID | None) -> list[Department]:
        if requested_department_id:
            row = await db.execute(select(Department).where(Department.id == requested_department_id))
            department = row.scalar_one_or_none()
            if not department:
                raise HTTPException(404, "Selected department not found")
            return [department]

        row = await db.execute(select(Department).order_by(Department.name.asc()))
        departments = row.scalars().all()
        if not departments:
            raise HTTPException(400, "No department configured. Ask TPO/Admin to create a department first.")
        return departments

    @staticmethod
    async def _ensure_active_tpo_for_departments(db: AsyncSession, departments: list[Department]) -> None:
        if not departments:
            return

        department_ids = [department.id for department in departments]
        rows = await db.execute(
            select(TPOCoordinator.department_id)
            .join(User, User.id == TPOCoordinator.user_id)
            .where(TPOCoordinator.department_id.in_(department_ids))
            .where(User.is_active.is_(True))
            .distinct()
        )
        active_department_ids = set(rows.scalars().all())
        missing_departments = [
            department.name
            for department in departments
            if department.id not in active_department_ids
        ]
        if missing_departments:
            raise HTTPException(
                400,
                "No active TPO assigned for selected department(s): " + ", ".join(missing_departments),
            )

    @staticmethod
    def _parse_job_meta(description: str) -> tuple[str, dict]:
        marker = "\n<!--META:"
        if marker not in description or not description.endswith("-->"):
            return description, {}
        text, meta_block = description.split(marker, 1)
        raw_json = meta_block[:-3]
        try:
            meta = json.loads(raw_json)
            return text.strip(), meta if isinstance(meta, dict) else {}
        except json.JSONDecodeError:
            return description, {}

    @staticmethod
    def _build_job_description(description: str, meta: dict) -> str:
        return f"{description.strip()}\n<!--META:{json.dumps(meta)}-->"

    @staticmethod
    def _extract_object_name_from_url(file_url: str) -> str | None:
        """
        Robustly extracts object name from MinIO URL.
        Handles different URL formats and hostnames (localhost, minio, IP addresses, etc.)
        """
        if not file_url or not isinstance(file_url, str):
            return None
        
        file_url = file_url.strip()
        if not file_url:
            return None
        
        try:
            parsed = urlparse(file_url)
            path = (parsed.path or "").lstrip("/")
            
            bucket_name = settings.minio_bucket_materials
            bucket_prefix = f"{bucket_name}/"
            
            # Try exact prefix match first
            if path.startswith(bucket_prefix):
                object_name = path[len(bucket_prefix):]
                if object_name:
                    return object_name
            
            # Fallback: split by bucket name and take everything after it
            if f"/{bucket_name}/" in path:
                parts = path.split(f"/{bucket_name}/", 1)
                if len(parts) == 2 and parts[1]:
                    return parts[1]
            
            return None
        except Exception:
            return None

    @staticmethod
    async def post_job(db: AsyncSession, current_user_id: uuid.UUID, data) -> dict:
        company = await RecruiterService._get_company_or_404(db, current_user_id)

        try:
            drive_date = datetime.fromisoformat(data.driveDate)
            deadline = datetime.fromisoformat(data.deadline)
        except ValueError as exc:
            raise HTTPException(422, "driveDate and deadline must be valid ISO date values") from exc

        target_departments = await RecruiterService._resolve_target_departments(db, data.department_id)
        if data.department_id:
            await RecruiterService._ensure_active_tpo_for_departments(db, target_departments)

        drive = PlacementDrive(
            company_id=company.id,
            name=f"{company.name} - {data.title}",
            drive_date=drive_date,
            registration_deadline=deadline,
            status="PENDING",
        )
        db.add(drive)
        await db.flush()

        meta = {
            "openings": data.openings,
            "minCGPA": data.minCGPA,
            "departmentScope": "SINGLE" if len(target_departments) == 1 else "ALL",
            "departmentIds": [str(dept.id) for dept in target_departments],
            "contactName": data.contactName,
            "contactRole": data.contactRole,
            "contactEmail": data.contactEmail,
            "contactPhone": data.contactPhone,
            "bondDurationMonths": data.bondDurationMonths,
            "bondDetails": data.bondDetails,
            "requiredDocuments": data.requiredDocuments,
            "approvalStatus": "pending",
            "roundSchedule": data.rounds,
        }

        job = Job(
            company_id=company.id,
            drive_id=drive.id,
            title=data.title,
            description=RecruiterService._build_job_description(data.description, meta),
            salary=int(float(data.salaryLpa) * 100000),
            application_deadline=deadline,
        )
        db.add(job)
        await db.flush()

        for department in target_departments:
            db.add(
                JobEligibility(
                    job_id=job.id,
                    department_id=department.id,
                    min_cgpa=data.minCGPA,
                    max_backlogs=99,
                )
            )

        db.add(JobLocation(job_id=job.id, location=data.location))
        for skill in data.skills:
            if skill and str(skill).strip():
                db.add(JobSkill(job_id=job.id, skill_name=str(skill).strip()))

        for index, round_item in enumerate(data.rounds, start=1):
            round_name = str(round_item.get("name") or f"Round {index}").strip()
            if not round_name:
                continue
            db.add(InterviewRound(job_id=job.id, name=round_name, round_order=index))

        await db.commit()
        return {
            "message": "Job request submitted to TPO",
            "jobId": str(job.id),
            "departmentIds": [str(dept.id) for dept in target_departments],
        }

    @staticmethod
    async def list_departments(db: AsyncSession) -> dict:
        rows = await db.execute(select(Department).order_by(Department.name.asc()))
        departments = rows.scalars().all()

        tpo_count_rows = await db.execute(
            select(TPOCoordinator.department_id, func.count(TPOCoordinator.id))
            .join(User, User.id == TPOCoordinator.user_id)
            .where(User.is_active.is_(True))
            .group_by(TPOCoordinator.department_id)
        )
        active_tpo_counts = {
            str(department_id): int(count)
            for department_id, count in tpo_count_rows.all()
        }

        return {
            "departments": [
                {
                    "id": str(department.id),
                    "name": department.name,
                    "hasActiveTpo": active_tpo_counts.get(str(department.id), 0) > 0,
                    "activeTpoCount": active_tpo_counts.get(str(department.id), 0),
                }
                for department in departments
            ]
        }

    @staticmethod
    async def get_jobs(db: AsyncSession, current_user_id: uuid.UUID) -> dict:
        company = await RecruiterService._get_company_or_404(db, current_user_id)
        rows = await db.execute(
            select(Job, PlacementDrive)
            .join(PlacementDrive, PlacementDrive.id == Job.drive_id, isouter=True)
            .where(Job.company_id == company.id)
            .order_by(Job.created_at.desc())
        )

        jobs = []
        for job, drive in rows.all():
            plain_desc, meta = RecruiterService._parse_job_meta(job.description)

            skills_rows = await db.execute(select(JobSkill.skill_name).where(JobSkill.job_id == job.id))
            skills = [row[0] for row in skills_rows.all()]
            loc_rows = await db.execute(select(JobLocation.location).where(JobLocation.job_id == job.id))
            locations = [row[0] for row in loc_rows.all()]
            round_rows = await db.execute(
                select(InterviewRound).where(InterviewRound.job_id == job.id).order_by(InterviewRound.round_order.asc())
            )
            round_schedule = [
                {
                    "id": str(r.id),
                    "name": r.name,
                    "date": "",
                    "time": "",
                    "mode": "Online",
                    "status": "scheduled",
                    "feedback": "",
                }
                for r in round_rows.scalars().all()
            ]

            jobs.append(
                {
                    "id": str(job.id),
                    "company": company.name,
                    "position": job.title,
                    "openings": meta.get("openings", 1),
                    "location": locations[0] if locations else "Not specified",
                    "ctc": f"{round((job.salary or 0) / 100000, 1)} LPA",
                    "minCGPA": meta.get("minCGPA", 0),
                    "skills": skills,
                    "bondDurationMonths": meta.get("bondDurationMonths", 0),
                    "bondDetails": meta.get("bondDetails", "No bond required."),
                    "driveDate": drive.drive_date.date().isoformat() if drive else "",
                    "deadline": job.application_deadline.date().isoformat() if job.application_deadline else "",
                    "contactName": meta.get("contactName", ""),
                    "contactRole": meta.get("contactRole", ""),
                    "contactEmail": meta.get("contactEmail", ""),
                    "contactPhone": meta.get("contactPhone", ""),
                    "description": plain_desc,
                    "selectionProcess": [r["name"] for r in round_schedule],
                    "roundSchedule": round_schedule,
                    "requiredDocuments": meta.get("requiredDocuments", []),
                    "approvalStatus": (drive.status if drive else "PENDING").lower(),
                }
            )

        return {"jobs": jobs}

    @staticmethod
    async def get_applicants(db: AsyncSession, current_user_id: uuid.UUID) -> dict:
        company = await RecruiterService._get_company_or_404(db, current_user_id)
        rows = await db.execute(
            select(JobApplication, Job, Student, User, Department.name)
            .join(Job, Job.id == JobApplication.job_id)
            .join(Student, Student.id == JobApplication.student_id)
            .join(User, User.id == Student.user_id)
            .join(Department, Department.id == Student.department_id, isouter=True)
            .where(Job.company_id == company.id)
            .order_by(JobApplication.created_at.desc())
        )

        apps = []
        cleaned_students: set[uuid.UUID] = set()
        demo_docs_deleted = False
        for app, job, student, user, department_name in rows.all():
            if student.id not in cleaned_students:
                cleanup_result = await db.execute(
                    delete(StudentDocument)
                    .where(StudentDocument.student_id == student.id)
                    .where(func.lower(StudentDocument.file_url).like("%demo%"))
                )
                if getattr(cleanup_result, "rowcount", 0):
                    demo_docs_deleted = True
                cleaned_students.add(student.id)

            doc_rows = await db.execute(
                select(StudentDocument)
                .where(StudentDocument.student_id == student.id)
                .order_by(StudentDocument.created_at.desc())
            )

            docs: list[dict] = []
            seen_types: set[str] = set()
            fallback_demo_docs: list[dict] = []
            fallback_demo_types: set[str] = set()

            for d in doc_rows.scalars().all():
                if d.document_type == "PROFILE_META_JSON":
                    continue

                file_name = os.path.basename(urlparse(d.file_url or "").path) or d.document_type
                normalized_name = file_name.lower()
                is_demo_artifact = "demo" in normalized_name

                item = {
                    "name": d.document_type,
                    "fileName": file_name,
                    "fileUrl": d.file_url,
                    "status": "verified",
                }

                # Prefer one latest non-demo document per document type.
                if not is_demo_artifact and d.document_type not in seen_types:
                    docs.append(item)
                    seen_types.add(d.document_type)
                    continue

                # Keep a fallback in case a type has only demo docs.
                if is_demo_artifact and d.document_type not in fallback_demo_types and d.document_type not in seen_types:
                    fallback_demo_docs.append(item)
                    fallback_demo_types.add(d.document_type)

            docs.extend(fallback_demo_docs)
            skill_rows = await db.execute(select(StudentSkill.skill_name).where(StudentSkill.student_id == student.id))
            student_skills = [row[0] for row in skill_rows.all()]

            apps.append(
                {
                    "id": str(app.id),
                    "jobRequestId": str(job.id),
                    "company": company.name,
                    "companyId": str(company.id),
                    "position": job.title,
                    "appliedAt": app.created_at.isoformat() if app.created_at else "",
                    "status": RecruiterService._app_status_to_frontend(app.status),
                    "result": "Application received",
                    "student": {
                        "fullName": user.email.split("@")[0].replace(".", " ").title(),
                        "enrollmentNo": student.enrollment_number,
                        "branch": department_name or "Department",
                        "year": "Final Year",
                        "cgpa": student.cgpa,
                        "email": user.email,
                        "phone": "",
                        "city": "",
                        "skills": student_skills,
                        "links": {
                            "linkedin": "#",
                            "github": "#",
                        },
                    },
                    "academics": {
                        "tenth": f"{student.tenth_percentage}%",
                        "twelfth": f"{student.twelfth_percentage}%",
                        "graduation": f"CGPA {student.cgpa}",
                        "activeBacklogs": student.backlog_count,
                    },
                    "documents": docs,
                    "rounds": [],
                    "notes": "",
                    "contactedAt": "",
                }
            )

        if demo_docs_deleted:
            await db.commit()

        return {"applications": apps}

    @staticmethod
    async def get_applicant_document(
        db: AsyncSession,
        current_user_id: uuid.UUID,
        application_id: uuid.UUID,
        file_url: str,
    ) -> dict:
        company = await RecruiterService._get_company_or_404(db, current_user_id)

        app_row = await db.execute(
            select(JobApplication, Job)
            .join(Job, Job.id == JobApplication.job_id)
            .where(JobApplication.id == application_id)
            .where(Job.company_id == company.id)
        )
        data = app_row.one_or_none()
        if not data:
            raise HTTPException(404, "Application not found")

        application, _ = data
        requested_object_name = RecruiterService._extract_object_name_from_url(file_url)
        if not requested_object_name:
            raise HTTPException(400, "Invalid document URL")

        docs_rows = await db.execute(
            select(StudentDocument)
            .where(StudentDocument.student_id == application.student_id)
            .order_by(StudentDocument.created_at.desc())
        )
        docs = docs_rows.scalars().all()

        allowed_object_names = {
            object_name
            for object_name in (
                RecruiterService._extract_object_name_from_url(doc.file_url)
                for doc in docs
                if doc.document_type != "PROFILE_META_JSON"
            )
            if object_name
        }

        if requested_object_name not in allowed_object_names:
            raise HTTPException(404, "Document not found")

        try:
            content, content_type = minio_client.get_object_bytes(settings.minio_bucket_materials, requested_object_name)
        except Exception as exc:
            raise HTTPException(404, "Unable to load document") from exc

        guessed_type, _ = mimetypes.guess_type(requested_object_name)
        media_type = guessed_type or content_type or "application/octet-stream"
        filename = os.path.basename(requested_object_name)

        return {
            "content": content,
            "media_type": media_type,
            "filename": filename,
        }

    @staticmethod
    def _app_status_to_frontend(status: str) -> str:
        key = (status or "").upper()
        if key == "SHORTLISTED":
            return "shortlisted"
        if key == "OFFERED" or key == "PLACED":
            return "offer"
        if key == "REJECTED":
            return "rejected"
        return "applied"

    @staticmethod
    def _frontend_to_app_status(status: str) -> str:
        key = (status or "").lower()
        if key == "shortlisted":
            return "SHORTLISTED"
        if key == "offer":
            return "OFFERED"
        if key == "rejected":
            return "REJECTED"
        if key == "interview":
            return "SHORTLISTED"
        return "APPLIED"

    @staticmethod
    async def update_application_status(
        db: AsyncSession,
        current_user_id: uuid.UUID,
        application_id: uuid.UUID,
        status: str,
    ) -> dict:
        company = await RecruiterService._get_company_or_404(db, current_user_id)
        row = await db.execute(
            select(JobApplication, Job)
            .join(Job, Job.id == JobApplication.job_id)
            .where(JobApplication.id == application_id)
            .where(Job.company_id == company.id)
        )
        data = row.one_or_none()
        if not data:
            raise HTTPException(404, "Application not found")

        application, _ = data
        application.status = RecruiterService._frontend_to_app_status(status)
        await db.commit()
        return {"message": "Application status updated"}

    @staticmethod
    async def release_offer(
        db: AsyncSession,
        current_user_id: uuid.UUID,
        application_id: uuid.UUID,
        salary_lpa: float,
        status: str,
        offer_letter_url: str,
    ) -> dict:
        company = await RecruiterService._get_company_or_404(db, current_user_id)
        row = await db.execute(
            select(JobApplication, Job)
            .join(Job, Job.id == JobApplication.job_id)
            .where(JobApplication.id == application_id)
            .where(Job.company_id == company.id)
        )
        data = row.one_or_none()
        if not data:
            raise HTTPException(404, "Application not found")

        application, _ = data
        offer_row = await db.execute(select(Offer).where(Offer.application_id == application.id))
        offer = offer_row.scalar_one_or_none()
        normalized_status = (status or "PENDING").upper()

        if offer:
            offer.salary = int(salary_lpa * 100000)
            offer.status = normalized_status
            offer.offer_letter_url = offer_letter_url or offer.offer_letter_url
        else:
            offer = Offer(
                application_id=application.id,
                salary=int(salary_lpa * 100000),
                status=normalized_status,
                offer_letter_url=offer_letter_url or "",
            )
            db.add(offer)

        application.status = "OFFERED"
        await db.commit()
        return {"message": "Offer saved", "offerId": str(offer.id)}

    @staticmethod
    async def get_offers(db: AsyncSession, current_user_id: uuid.UUID) -> dict:
        company = await RecruiterService._get_company_or_404(db, current_user_id)
        rows = await db.execute(
            select(Offer, JobApplication, Job, Student, User)
            .join(JobApplication, JobApplication.id == Offer.application_id)
            .join(Job, Job.id == JobApplication.job_id)
            .join(Student, Student.id == JobApplication.student_id)
            .join(User, User.id == Student.user_id)
            .where(Job.company_id == company.id)
            .order_by(Offer.created_at.desc())
        )

        offers = []
        for offer, app, job, student, user in rows.all():
            offers.append(
                {
                    "id": str(app.id),
                    "studentName": user.email.split("@")[0].replace(".", " ").title(),
                    "company": company.name,
                    "position": job.title,
                    "salary": f"{round((offer.salary or 0) / 100000, 1)} LPA",
                    "offerDate": offer.created_at.isoformat() if offer.created_at else "",
                    "joiningDate": "",
                    "acceptance": (offer.status or "PENDING").lower(),
                    "studentEmail": user.email,
                    "studentPhone": "",
                }
            )

        return {"offers": offers}

    @staticmethod
    async def update_offer_status(
        db: AsyncSession,
        current_user_id: uuid.UUID,
        application_id: uuid.UUID,
        status: str,
    ) -> dict:
        company = await RecruiterService._get_company_or_404(db, current_user_id)
        row = await db.execute(
            select(Offer, Job)
            .join(JobApplication, JobApplication.id == Offer.application_id)
            .join(Job, Job.id == JobApplication.job_id)
            .where(Offer.application_id == application_id)
            .where(Job.company_id == company.id)
        )
        data = row.one_or_none()
        if not data:
            raise HTTPException(404, "Offer not found")
        offer, _ = data
        offer.status = (status or "PENDING").upper()
        await db.commit()
        return {"message": "Offer status updated"}

    @staticmethod
    async def get_dashboard(db: AsyncSession, current_user_id: uuid.UUID) -> dict:
        jobs = (await RecruiterService.get_jobs(db, current_user_id))["jobs"]
        applications = (await RecruiterService.get_applicants(db, current_user_id))["applications"]

        stats = {
            "activeJobs": len([j for j in jobs if j.get("approvalStatus") != "rejected"]),
            "totalApplicants": len(applications),
            "shortlisted": len([a for a in applications if a.get("status") == "shortlisted"]),
            "interviews": len([a for a in applications if a.get("status") == "interview"]),
            "offersMade": len([a for a in applications if a.get("status") == "offer"]),
        }

        recent = applications[:6]
        upcoming = []
        return {"stats": stats, "recentApplications": recent, "upcomingRounds": upcoming}
