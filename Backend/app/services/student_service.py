from __future__ import annotations

import json
import mimetypes
import os
import re
import uuid
from datetime import datetime
from urllib.parse import urlparse

from fastapi import HTTPException, UploadFile
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.job_application import JobApplication
from app.models.job_eligibility import JobEligibility
from app.models.job_location import JobLocation
from app.models.job_skills import JobSkill
from app.models.departments import Department
from app.models.offers import Offer
from app.models.resume_ai_analysis import ResumeAIAnalysis
from app.models.resume_versions import ResumeVersion
from app.models.resumes import Resume
from app.models.student_document import StudentDocument
from app.models.student_skills import StudentSkill
from app.models.students import Student
from app.models.user import User
from app.repositories import tpo_feature_repo
from app.storage import minio_client


class StudentService:
    PROFILE_META_DOC_TYPE = "PROFILE_META_JSON"

    @staticmethod
    def _extract_numeric_score(value: str | int | float | None) -> float | None:
        if value is None:
            return None
        if isinstance(value, (int, float)):
            return float(value)
        if not isinstance(value, str):
            return None

        match = re.search(r"\d+(?:\.\d+)?", value)
        if not match:
            return None
        try:
            return float(match.group(0))
        except ValueError:
            return None

    @staticmethod
    async def _get_student_or_404(db: AsyncSession, current_user_id: uuid.UUID) -> tuple[Student, User]:
        row = await db.execute(
            select(Student, User)
            .join(User, User.id == Student.user_id)
            .where(Student.user_id == current_user_id)
        )
        data = row.one_or_none()
        if not data:
            raise HTTPException(404, "Student profile not found")
        return data[0], data[1]

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
    def _status_to_frontend(status: str | None) -> str:
        mapping = {
            "APPLIED": "applied",
            "INTERVIEW": "pending",
            "SHORTLISTED": "shortlisted",
            "REJECTED": "rejected",
            "OFFERED": "offer",
            "PLACED": "offer",
        }
        return mapping.get((status or "").upper(), "pending")

    @staticmethod
    def _safe_json_loads(value: str | None, fallback: dict) -> dict:
        if not value:
            return fallback
        try:
            parsed = json.loads(value)
            return parsed if isinstance(parsed, dict) else fallback
        except json.JSONDecodeError:
            return fallback

    @staticmethod
    async def get_dashboard(db: AsyncSession, current_user_id: uuid.UUID) -> dict:
        student_row = await db.execute(select(Student).where(Student.user_id == current_user_id))
        student = student_row.scalar_one_or_none()
        if not student:
            return {
                "stats": {
                    "applied": 0,
                    "pending": 0,
                    "rejected": 0,
                    "shortlisted": 0,
                    "upcomingTasks": 0,
                },
                "recentApplications": [],
                "upcomingPlacementTasks": [],
            }

        timeline = await tpo_feature_repo.get_student_timeline(db, student.id)
        applications = timeline.get("applications", [])

        stats = {
            "applied": 0,
            "pending": 0,
            "rejected": 0,
            "shortlisted": 0,
            "upcomingTasks": 0,
        }
        recent_applications = []

        for app in applications:
            status = StudentService._status_to_frontend(app.get("status"))
            if status in stats:
                stats[status] += 1

            recent_applications.append(
                {
                    "id": str(app.get("application_id")),
                    "company": app.get("job", {}).get("company", {}).get("name", "-"),
                    "position": app.get("job", {}).get("title", "-"),
                    "status": status,
                    "appliedDate": app.get("created_at"),
                }
            )

        recent_applications = sorted(
            recent_applications,
            key=lambda item: item.get("appliedDate") or "",
            reverse=True,
        )[:5]

        return {
            "stats": stats,
            "recentApplications": recent_applications,
            "upcomingPlacementTasks": [],
        }

    @staticmethod
    async def get_profile(db: AsyncSession, current_user_id: uuid.UUID) -> dict:
        student, user = await StudentService._get_student_or_404(db, current_user_id)

        department_row = await db.execute(
            select(Department.name).where(Department.id == student.department_id)
        )
        department_name = department_row.scalar_one_or_none() or "Department"

        skills_rows = await db.execute(
            select(StudentSkill.skill_name)
            .where(StudentSkill.student_id == student.id)
            .order_by(StudentSkill.skill_name.asc())
        )
        skills = [row[0] for row in skills_rows.all()]

        docs_rows = await db.execute(
            select(StudentDocument)
            .where(StudentDocument.student_id == student.id)
            .order_by(StudentDocument.created_at.desc())
        )
        docs = docs_rows.scalars().all()

        meta_doc = next((d for d in docs if d.document_type == StudentService.PROFILE_META_DOC_TYPE), None)
        meta = StudentService._safe_json_loads(meta_doc.file_url if meta_doc else None, {})

        department_profile = {
            "fullName": meta.get("departmentProfile", {}).get("fullName", user.email.split("@")[0].replace(".", " ").title()),
            "enrollmentNo": student.enrollment_number,
            "collegeEmail": user.email,
            "branch": meta.get("departmentProfile", {}).get("branch", department_name),
            "program": meta.get("departmentProfile", {}).get("program", "Program"),
            "year": meta.get("departmentProfile", {}).get("year", "Final Year"),
            "batch": meta.get("departmentProfile", {}).get("batch", "Current Batch"),
            "section": meta.get("departmentProfile", {}).get("section", "A"),
            "mentor": meta.get("departmentProfile", {}).get("mentor", "Placement Mentor"),
            "departmentStatus": "Verified by Department",
        }

        default_profile_data = {
            "personalEmail": user.email,
            "phone": "",
            "alternatePhone": "",
            "dateOfBirth": "",
            "gender": "",
            "city": "",
            "state": "",
            "address": "",
            "linkedin": "",
            "github": "",
            "portfolio": "",
            "summary": "",
            "graduationCgpa": str(student.cgpa),
            "profileImage": "",
        }
        profile_data = {**default_profile_data, **meta.get("profileData", {})}
        profile_data["graduationCgpa"] = str(student.cgpa)
        profile_data["profileImage"] = student.profile_image or profile_data.get("profileImage", "")

        default_education = [
            {
                "id": "ten",
                "label": "Class 10 (SSC)",
                "board": "",
                "institute": "",
                "year": "",
                "score": f"{student.tenth_percentage}%",
                "fileName": "",
            },
            {
                "id": "twelve",
                "label": "Class 12 (HSC)",
                "board": "",
                "institute": "",
                "year": "",
                "score": f"{student.twelfth_percentage}%",
                "fileName": "",
            },
            {
                "id": "grad",
                "label": "Current Graduation",
                "board": "",
                "institute": "",
                "year": "",
                "score": f"CGPA {student.cgpa}",
                "fileName": "",
            },
        ]

        meta_education = meta.get("educationRecords") if isinstance(meta.get("educationRecords"), list) else []
        if meta_education:
            merged_education = [dict(item) for item in default_education]
            for record in meta_education:
                if not isinstance(record, dict):
                    continue
                rec_id = record.get("id")
                rec_label = str(record.get("label", "")).strip().lower()
                match_index = next(
                    (
                        index
                        for index, item in enumerate(merged_education)
                        if (rec_id and item.get("id") == rec_id)
                        or (rec_label and str(item.get("label", "")).strip().lower() == rec_label)
                    ),
                    None,
                )
                if match_index is not None:
                    merged_education[match_index] = {**merged_education[match_index], **record}
                else:
                    merged_education.append(record)
            education_records = merged_education
        else:
            education_records = default_education

        certifications = meta.get("certifications") or []
        projects = meta.get("projects") or []

        additional_docs = meta.get("additionalDocs") or [
            {
                "id": f"doc-{index}",
                "label": doc.document_type.replace("_", " ").title(),
                "fileName": os.path.basename(doc.file_url),
                "fileUrl": doc.file_url,
            }
            for index, doc in enumerate(docs)
            if doc.document_type != StudentService.PROFILE_META_DOC_TYPE
        ]

        return {
            "departmentProfile": department_profile,
            "profileData": profile_data,
            "educationRecords": education_records,
            "skills": skills or meta.get("skills", []),
            "projects": projects,
            "certifications": certifications,
            "additionalDocs": additional_docs,
        }

    @staticmethod
    async def update_profile(db: AsyncSession, current_user_id: uuid.UUID, data) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)

        profile_data = (data.profileData or {}) if hasattr(data, "profileData") else {}
        try:
            cgpa = float(profile_data.get("graduationCgpa", student.cgpa))
            if 0 <= cgpa <= 10:
                student.cgpa = cgpa
        except (TypeError, ValueError):
            pass

        incoming_education_records = data.educationRecords or []
        for record in incoming_education_records:
            if not isinstance(record, dict):
                continue

            record_key = f"{record.get('id', '')} {record.get('label', '')}".strip().lower()
            score_value = StudentService._extract_numeric_score(record.get("score"))
            if score_value is None:
                continue

            if "ten" in record_key or "10" in record_key or "ssc" in record_key:
                student.tenth_percentage = score_value
            elif "twelve" in record_key or "12" in record_key or "hsc" in record_key:
                student.twelfth_percentage = score_value
            elif "grad" in record_key or "graduation" in record_key or "cgpa" in record_key:
                if 0 <= score_value <= 10:
                    student.cgpa = score_value

        profile_image = profile_data.get("profileImage")
        if isinstance(profile_image, str) and profile_image.strip():
            student.profile_image = profile_image.strip()

        incoming_skills = [s.strip() for s in (data.skills or []) if isinstance(s, str) and s.strip()]
        await db.execute(delete(StudentSkill).where(StudentSkill.student_id == student.id))
        for skill in incoming_skills:
            db.add(StudentSkill(student_id=student.id, skill_name=skill))

        metadata_payload = {
            "profileData": data.profileData or {},
            "educationRecords": incoming_education_records,
            "projects": data.projects or [],
            "certifications": data.certifications or [],
            "additionalDocs": data.additionalDocs or [],
            "skills": incoming_skills,
        }

        existing_meta = await db.execute(
            select(StudentDocument)
            .where(StudentDocument.student_id == student.id)
            .where(StudentDocument.document_type == StudentService.PROFILE_META_DOC_TYPE)
        )
        meta_doc = existing_meta.scalar_one_or_none()
        if meta_doc:
            meta_doc.file_url = json.dumps(metadata_payload)
        else:
            db.add(
                StudentDocument(
                    student_id=student.id,
                    document_type=StudentService.PROFILE_META_DOC_TYPE,
                    file_url=json.dumps(metadata_payload),
                )
            )

        await db.commit()
        return {"message": "Profile updated successfully"}

    @staticmethod
    async def upload_profile_document(
        db: AsyncSession,
        current_user_id: uuid.UUID,
        category: str,
        file: UploadFile,
        label: str | None = None,
    ) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)

        normalized_category = (category or "").strip().lower()
        allowed_categories = {"education", "additional", "profile_photo"}
        if normalized_category not in allowed_categories:
            raise HTTPException(400, "Invalid category. Use education, additional, or profile_photo")

        content = await file.read()
        if not content:
            raise HTTPException(400, "Uploaded file is empty")

        object_name = f"student-documents/{student.id}/{normalized_category}/{uuid.uuid4().hex}_{file.filename}"
        minio_client.upload_bytes(
            settings.minio_bucket_materials,
            object_name,
            content,
            file.content_type or "application/octet-stream",
        )
        file_url = minio_client.build_file_url(settings.minio_bucket_materials, object_name)

        if normalized_category == "profile_photo":
            student.profile_image = file_url
            existing_meta = await db.execute(
                select(StudentDocument)
                .where(StudentDocument.student_id == student.id)
                .where(StudentDocument.document_type == StudentService.PROFILE_META_DOC_TYPE)
            )
            meta_doc = existing_meta.scalar_one_or_none()
            meta = StudentService._safe_json_loads(meta_doc.file_url if meta_doc else None, {})
            profile_data = meta.get("profileData", {}) if isinstance(meta.get("profileData"), dict) else {}
            profile_data["profileImage"] = file_url
            meta["profileData"] = profile_data

            if meta_doc:
                meta_doc.file_url = json.dumps(meta)
            else:
                db.add(
                    StudentDocument(
                        student_id=student.id,
                        document_type=StudentService.PROFILE_META_DOC_TYPE,
                        file_url=json.dumps(meta),
                    )
                )
            await db.commit()
            return {
                "category": normalized_category,
                "fileName": file.filename,
                "fileUrl": file_url,
                "documentType": "PROFILE_PHOTO",
            }

        safe_suffix = "".join(
            ch if ch.isalnum() else "_" for ch in (label or normalized_category)
        ).strip("_")[:32]
        suffix = safe_suffix or normalized_category.upper()
        document_type = f"PROFILE_{normalized_category.upper()}_{suffix.upper()}"

        student_doc = StudentDocument(
            student_id=student.id,
            document_type=document_type,
            file_url=file_url,
        )
        db.add(student_doc)
        await db.flush()

        existing_meta = await db.execute(
            select(StudentDocument)
            .where(StudentDocument.student_id == student.id)
            .where(StudentDocument.document_type == StudentService.PROFILE_META_DOC_TYPE)
        )
        meta_doc = existing_meta.scalar_one_or_none()
        meta = StudentService._safe_json_loads(meta_doc.file_url if meta_doc else None, {})

        if normalized_category == "education":
            education_records = meta.get("educationRecords", [])
            if not isinstance(education_records, list):
                education_records = []

            normalized_label = (label or "Education Record").strip()
            matched = False
            for item in education_records:
                if isinstance(item, dict) and str(item.get("label", "")).strip().lower() == normalized_label.lower():
                    item["fileName"] = file.filename
                    item["fileUrl"] = file_url
                    matched = True
                    break

            if not matched:
                education_records.append(
                    {
                        "id": f"uploaded-{uuid.uuid4().hex[:8]}",
                        "label": normalized_label,
                        "board": "",
                        "institute": "",
                        "year": "",
                        "score": "",
                        "fileName": file.filename,
                        "fileUrl": file_url,
                    }
                )
            meta["educationRecords"] = education_records
        else:
            additional_docs = meta.get("additionalDocs", [])
            if not isinstance(additional_docs, list):
                additional_docs = []

            normalized_label = (label or "Additional Document").strip()
            matched = False
            for item in additional_docs:
                if isinstance(item, dict) and str(item.get("label", "")).strip().lower() == normalized_label.lower():
                    item["fileName"] = file.filename
                    item["fileUrl"] = file_url
                    matched = True
                    break

            if not matched:
                additional_docs.append(
                    {
                        "id": f"doc-{uuid.uuid4().hex[:8]}",
                        "label": normalized_label,
                        "fileName": file.filename,
                        "fileUrl": file_url,
                    }
                )
            meta["additionalDocs"] = additional_docs

        if meta_doc:
            meta_doc.file_url = json.dumps(meta)
        else:
            db.add(
                StudentDocument(
                    student_id=student.id,
                    document_type=StudentService.PROFILE_META_DOC_TYPE,
                    file_url=json.dumps(meta),
                )
            )

        await db.commit()

        return {
            "id": str(student_doc.id),
            "category": normalized_category,
            "label": label or normalized_category.replace("_", " ").title(),
            "fileName": file.filename,
            "fileUrl": file_url,
            "documentType": document_type,
        }

    @staticmethod
    async def view_profile_document(db: AsyncSession, current_user_id: uuid.UUID, file_url: str) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)
        requested_object_name = StudentService._extract_object_name_from_url(file_url)
        if not requested_object_name:
            raise HTTPException(400, "Invalid document URL")

        docs_rows = await db.execute(
            select(StudentDocument)
            .where(StudentDocument.student_id == student.id)
            .order_by(StudentDocument.created_at.desc())
        )
        docs = docs_rows.scalars().all()

        allowed_urls: set[str] = set()
        for doc in docs:
            if doc.document_type != StudentService.PROFILE_META_DOC_TYPE:
                allowed_urls.add(doc.file_url)

        meta_doc = next((d for d in docs if d.document_type == StudentService.PROFILE_META_DOC_TYPE), None)
        meta = StudentService._safe_json_loads(meta_doc.file_url if meta_doc else None, {})

        profile_data = meta.get("profileData", {}) if isinstance(meta.get("profileData"), dict) else {}
        profile_image = profile_data.get("profileImage")
        if isinstance(profile_image, str) and profile_image.strip():
            allowed_urls.add(profile_image)

        education_records = meta.get("educationRecords") if isinstance(meta.get("educationRecords"), list) else []
        for record in education_records:
            if not isinstance(record, dict):
                continue
            record_url = record.get("fileUrl")
            if isinstance(record_url, str) and record_url.strip():
                allowed_urls.add(record_url)

        additional_docs = meta.get("additionalDocs") if isinstance(meta.get("additionalDocs"), list) else []
        for record in additional_docs:
            if not isinstance(record, dict):
                continue
            record_url = record.get("fileUrl")
            if isinstance(record_url, str) and record_url.strip():
                allowed_urls.add(record_url)

        allowed_object_names = {
            object_name
            for object_name in (StudentService._extract_object_name_from_url(url) for url in allowed_urls)
            if object_name
        }

        if requested_object_name not in allowed_object_names:
            raise HTTPException(404, "Document not found")

        try:
            data, content_type = minio_client.get_object_bytes(settings.minio_bucket_materials, requested_object_name)
        except Exception as exc:
            raise HTTPException(404, "Unable to load document") from exc

        guessed_type, _ = mimetypes.guess_type(requested_object_name)
        media_type = guessed_type or content_type or "application/octet-stream"
        filename = os.path.basename(requested_object_name)

        return {
            "content": data,
            "media_type": media_type,
            "filename": filename,
        }

    @staticmethod
    async def get_profile_image(db: AsyncSession, current_user_id: uuid.UUID) -> dict:
        """Get the student's profile image."""
        student, _ = await StudentService._get_student_or_404(db, current_user_id)
        
        # Get the profile metadata document
        meta_doc_row = await db.execute(
            select(StudentDocument)
            .where(StudentDocument.student_id == student.id)
            .where(StudentDocument.document_type == StudentService.PROFILE_META_DOC_TYPE)
        )
        meta_doc = meta_doc_row.scalar_one_or_none()
        
        if not meta_doc:
            return None
        
        meta = StudentService._safe_json_loads(meta_doc.file_url, {})
        profile_data = meta.get("profileData", {}) if isinstance(meta.get("profileData"), dict) else {}
        profile_image_url = profile_data.get("profileImage")
        
        if not profile_image_url:
            return None
        
        requested_object_name = StudentService._extract_object_name_from_url(profile_image_url)
        if not requested_object_name:
            return None
        
        try:
            data, content_type = minio_client.get_object_bytes(settings.minio_bucket_materials, requested_object_name)
        except Exception:
            return None
        
        guessed_type, _ = mimetypes.guess_type(requested_object_name)
        media_type = content_type or guessed_type or "image/png"
        
        return {
            "content": data,
            "media_type": media_type,
        }

    @staticmethod
    async def list_jobs(db: AsyncSession, current_user_id: uuid.UUID) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)
        jobs = await tpo_feature_repo.list_active_jobs(db)

        job_ids = [job["id"] for job in jobs]
        locations_rows = await db.execute(select(JobLocation.job_id, JobLocation.location).where(JobLocation.job_id.in_(job_ids))) if job_ids else None
        skills_rows = await db.execute(select(JobSkill.job_id, JobSkill.skill_name).where(JobSkill.job_id.in_(job_ids))) if job_ids else None
        elig_rows = await db.execute(
            select(JobEligibility.job_id, JobEligibility.min_cgpa, JobEligibility.max_backlogs)
            .where(JobEligibility.job_id.in_(job_ids))
            .where(JobEligibility.department_id == student.department_id)
        ) if job_ids else None

        location_map: dict = {}
        if locations_rows:
            for job_id, location in locations_rows.all():
                location_map.setdefault(job_id, []).append(location)

        skill_map: dict = {}
        if skills_rows:
            for job_id, skill_name in skills_rows.all():
                skill_map.setdefault(job_id, []).append(skill_name)

        eligibility_map: dict = {}
        if elig_rows:
            for job_id, min_cgpa, max_backlogs in elig_rows.all():
                eligibility_map[job_id] = {
                    "minCGPA": min_cgpa,
                    "maxBacklogs": max_backlogs,
                }

        payload = []
        for job in jobs:
            if str(job.get("approval_status") or "").upper() != "APPROVED":
                continue

            eligibility = eligibility_map.get(job["id"])
            min_cgpa = eligibility.get("minCGPA") if eligibility else None
            max_backlogs = eligibility.get("maxBacklogs") if eligibility else None
            is_eligible = bool(
                eligibility
                and student.cgpa >= float(min_cgpa)
                and student.backlog_count <= int(max_backlogs)
            )

            payload.append(
                {
                    "id": str(job["id"]),
                    "company": job.get("company", {}).get("name", "Company"),
                    "position": job.get("title", "Role"),
                    "description": job.get("description", ""),
                    "minCGPA": min_cgpa,
                    "skills": skill_map.get(job["id"], []),
                    "ctc": f"{round((job.get('salary', 0) or 0) / 100000, 1)} LPA",
                    "locations": location_map.get(job["id"], ["TBD"]),
                    "deadline": job.get("application_deadline"),
                    "eligible": is_eligible,
                }
            )

        return {"jobs": payload, "studentCgpa": student.cgpa}

    @staticmethod
    async def apply_for_job(db: AsyncSession, current_user_id: uuid.UUID, job_id: uuid.UUID) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)

        # Check if student has already accepted an offer
        accepted_offer = await db.execute(
            select(Offer)
            .join(JobApplication, JobApplication.id == Offer.application_id)
            .where(JobApplication.student_id == student.id)
            .where(Offer.status.in_(["ACCEPTED", "JOINED", "ACCEPTED_BUT_NOT_JOINED"]))
        )
        if accepted_offer.scalar_one_or_none():
            raise HTTPException(400, "You cannot apply for jobs after accepting an offer from another company")

        elig = await db.execute(
            select(JobEligibility)
            .where(JobEligibility.job_id == job_id)
            .where(JobEligibility.department_id == student.department_id)
        )
        eligibility = elig.scalar_one_or_none()
        if not eligibility:
            raise HTTPException(404, "Job not available for your department")

        if student.cgpa < eligibility.min_cgpa or student.backlog_count > eligibility.max_backlogs:
            raise HTTPException(400, "You are not eligible for this job")

        existing = await db.execute(
            select(JobApplication)
            .where(JobApplication.job_id == job_id)
            .where(JobApplication.student_id == student.id)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(400, "You already applied for this job")

        app = JobApplication(student_id=student.id, job_id=job_id, status="APPLIED")
        db.add(app)
        await db.commit()
        return {"message": "Application submitted", "applicationId": app.id}

    @staticmethod
    async def list_applications(db: AsyncSession, current_user_id: uuid.UUID) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)
        return await tpo_feature_repo.get_student_timeline(db, student.id)

    @staticmethod
    async def get_application_status(db: AsyncSession, current_user_id: uuid.UUID, application_id: uuid.UUID) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)
        data = await tpo_feature_repo.get_student_timeline(db, student.id)
        target = next(
            (app for app in data.get("applications", []) if str(app.get("application_id")) == str(application_id)),
            None,
        )
        if not target:
            raise HTTPException(404, "Application not found")
        return target

    @staticmethod
    async def get_resume_insights(db: AsyncSession, current_user_id: uuid.UUID) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)
        history = await tpo_feature_repo.get_student_resume_analysis_history(db, student.id)
        resumes = history.get("resumes", [])

        latest_ats = None
        detected_skills = []
        skill_gaps = []
        latest_analysis = None

        suggestions: list[str] = []
        improvements: list[str] = []
        analysis_source = "fallback"

        if resumes and resumes[0].get("ai_analysis"):
            latest_analysis = resumes[0]["ai_analysis"][0]
            latest_ats = latest_analysis.get("ats_score")
            detected_skills = latest_analysis.get("detected_skills") or []
            skill_gaps = latest_analysis.get("skill_gaps") or []

            if isinstance(detected_skills, dict):
                detected_skills = detected_skills.get("skills") or list(detected_skills.values())

            if isinstance(skill_gaps, dict):
                suggestions = list(skill_gaps.get("suggestions") or [])
                improvements = list(skill_gaps.get("improvements") or [])
                analysis_source = skill_gaps.get("source") or "ai"
                skill_gaps = skill_gaps.get("gaps") or []

        if isinstance(detected_skills, dict):
            detected_skills = list(detected_skills.values())
        if isinstance(skill_gaps, dict):
            skill_gaps = list(skill_gaps.values())

        if not detected_skills:
            skill_rows = await db.execute(select(StudentSkill.skill_name).where(StudentSkill.student_id == student.id))
            detected_skills = [
                {"name": name, "level": 65, "inBidding": True}
                for (name,) in skill_rows.all()
            ]

        normalized_skills = []
        for item in detected_skills:
            if isinstance(item, str):
                normalized_skills.append({"name": item, "level": 65, "inBidding": False})
                continue
            if isinstance(item, dict):
                level = int(item.get("level") or 0)
                if 0 < level <= 10:
                    level = level * 10
                normalized_skills.append(
                    {
                        "name": str(item.get("name") or "Skill"),
                        "level": max(0, min(100, level or 60)),
                        "inBidding": bool(item.get("inBidding")),
                    }
                )
        detected_skills = normalized_skills or detected_skills

        if latest_ats is None:
            latest_ats = min(95, int(55 + len(detected_skills) * 5 + student.cgpa * 2))

        if not skill_gaps:
            skill_gaps = [
                {"skill": "System Design", "demand": 85, "yourLevel": 40},
                {"skill": "Cloud Computing", "demand": 90, "yourLevel": 35},
            ]

        normalized_gaps = []
        for gap in skill_gaps:
            if not isinstance(gap, dict):
                continue
            demand = int(gap.get("demand") or gap.get("marketDemand") or 80)
            your_level = int(gap.get("yourLevel") or gap.get("currentLevel") or 35)
            if 0 < demand <= 10:
                demand = demand * 20
            if 0 < your_level <= 10:
                your_level = your_level * 20
            normalized_gaps.append(
                {
                    "skill": str(gap.get("skill") or gap.get("name") or "Skill Gap"),
                    "demand": max(0, min(100, demand)),
                    "yourLevel": max(0, min(100, your_level)),
                }
            )
        skill_gaps = normalized_gaps or skill_gaps

        latest_resume = resumes[0] if resumes else {}
        latest_resume_url = latest_resume.get("file_url") or ""
        latest_resume_name = os.path.basename(urlparse(latest_resume_url).path) if latest_resume_url else None

        analyzed_at = None
        if latest_resume.get("ai_analysis"):
            analyzed_at = latest_resume["ai_analysis"][0].get("created_at")
        if not analyzed_at:
            analyzed_at = latest_resume.get("updated_at") or latest_resume.get("created_at")

        if not suggestions:
            suggestions = [
                "Add measurable outcomes for projects and internships.",
                "Keep skills section aligned with role keywords.",
                "Upload updated resume before each drive.",
            ]

        if not improvements:
            improvements = [
                "Use role-specific keywords in project and experience bullets.",
                "Quantify impact in top 3 resume points.",
                "Strengthen the weakest in-demand skill with one practical project.",
            ]

        should_refresh_with_ai = bool(resumes) and (
            analysis_source != "ai"
            or not improvements
            or not skill_gaps
        )

        if should_refresh_with_ai:
            try:
                from app.services.student_ai_service import StudentAIService

                latest_resume_id = latest_resume.get("id")
                latest_resume_url = latest_resume.get("file_url") or ""
                object_name = StudentService._extract_object_name_from_url(latest_resume_url)
                if object_name:
                    file_bytes, _ = minio_client.get_object_bytes(settings.minio_bucket_materials, object_name)
                    resume_text = StudentAIService._extract_text_from_resume(file_bytes, latest_resume_url)

                    jobs_payload = await StudentService.list_jobs(db, current_user_id)
                    jobs = jobs_payload.get("jobs", [])

                    ai_analysis = await StudentAIService.analyze_resume_insights(
                        student=student,
                        resume_text=resume_text,
                        profile_skills=[item.get("name", "") for item in detected_skills if isinstance(item, dict)]
                        or [str(item) for item in detected_skills if isinstance(item, str)],
                        jobs=jobs,
                        fallback_ats=int(latest_ats),
                    )

                    latest_ats = int(ai_analysis.get("atsScore") or latest_ats)
                    detected_skills = ai_analysis.get("skills") or detected_skills
                    skill_gaps = ai_analysis.get("skillGaps") or skill_gaps
                    suggestions = ai_analysis.get("suggestions") or suggestions
                    improvements = ai_analysis.get("improvements") or improvements
                    analysis_source = ai_analysis.get("analysisSource") or "ai"

                    if latest_analysis:
                        analysis_row = await db.execute(
                            select(ResumeAIAnalysis).where(ResumeAIAnalysis.id == latest_analysis.get("id"))
                        )
                        analysis_obj = analysis_row.scalar_one_or_none()
                        if analysis_obj:
                            analysis_obj.ats_score = latest_ats
                            analysis_obj.detected_skills = detected_skills
                            analysis_obj.skill_gaps = {
                                "gaps": skill_gaps,
                                "suggestions": suggestions,
                                "improvements": improvements,
                                "source": analysis_source,
                            }
                            await db.commit()
            except Exception:
                pass

        return {
            "atsScore": latest_ats,
            "skills": detected_skills,
            "skillGaps": skill_gaps,
            "suggestions": suggestions,
            "improvements": improvements,
            "analysisSource": analysis_source,
            "hasResume": bool(resumes),
            "resumeFileName": latest_resume_name,
            "lastAnalyzedAt": analyzed_at,
        }

    @staticmethod
    async def upload_resume(db: AsyncSession, current_user_id: uuid.UUID, file: UploadFile) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)
        content = await file.read()
        if not content:
            raise HTTPException(400, "Uploaded file is empty")

        object_name = f"resumes/{student.id}/{uuid.uuid4().hex}_{file.filename}"
        minio_client.upload_bytes(
            settings.minio_bucket_materials,
            object_name,
            content,
            file.content_type or "application/octet-stream",
        )
        file_url = minio_client.build_file_url(settings.minio_bucket_materials, object_name)

        resume = Resume(student_id=student.id, file_url=file_url)
        db.add(resume)
        await db.flush()

        version = ResumeVersion(resume_id=resume.id, version_number=1, file_url=file_url)
        db.add(version)

        from app.services.student_ai_service import StudentAIService

        skill_rows = await db.execute(select(StudentSkill.skill_name).where(StudentSkill.student_id == student.id))
        skill_names = [row[0] for row in skill_rows.all()]
        fallback_ats = min(95, int(58 + len(skill_names) * 5 + student.cgpa * 2))

        jobs_payload = await StudentService.list_jobs(db, current_user_id)
        jobs = jobs_payload.get("jobs", [])
        resume_text = StudentAIService._extract_text_from_resume(content, file.filename or "resume.pdf")

        ai_analysis = await StudentAIService.analyze_resume_insights(
            student=student,
            resume_text=resume_text,
            profile_skills=skill_names,
            jobs=jobs,
            fallback_ats=fallback_ats,
        )

        ats = int(ai_analysis.get("atsScore") or fallback_ats)
        detected = ai_analysis.get("skills") or []
        gaps = ai_analysis.get("skillGaps") or []
        suggestions = ai_analysis.get("suggestions") or []
        improvements = ai_analysis.get("improvements") or []
        source = ai_analysis.get("analysisSource") or "fallback"

        analysis = ResumeAIAnalysis(
            resume_id=resume.id,
            ats_score=ats,
            detected_skills=detected,
            skill_gaps={
                "gaps": gaps,
                "suggestions": suggestions,
                "improvements": improvements,
                "source": source,
            },
        )
        db.add(analysis)
        await db.commit()

        return {
            "atsScore": ats,
            "skills": detected,
            "skillGaps": gaps,
            "suggestions": suggestions,
            "improvements": improvements,
            "analysisSource": source,
            "hasResume": True,
            "resumeFileName": file.filename,
            "lastAnalyzedAt": datetime.utcnow().isoformat(),
        }

    @staticmethod
    async def list_materials(db: AsyncSession, current_user_id: uuid.UUID) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)
        materials = await tpo_feature_repo.list_study_materials_for_department(db, student.department_id)
        return {"materials": materials}

    @staticmethod
    async def get_material_file(
        db: AsyncSession,
        current_user_id: uuid.UUID,
        material_id: uuid.UUID,
    ) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)
        material = await tpo_feature_repo.get_study_material(db, material_id)
        if not material:
            raise HTTPException(404, "Material not found")

        if not material.is_global and material.department_id != student.department_id:
            raise HTTPException(403, "You are not allowed to access this material")

        requested_object_name = StudentService._extract_object_name_from_url(material.file_url or "")
        if not requested_object_name:
            raise HTTPException(400, "Invalid material file URL")

        try:
            data, content_type = minio_client.get_object_bytes(settings.minio_bucket_materials, requested_object_name)
        except Exception as exc:
            raise HTTPException(404, "Unable to load material file") from exc

        guessed_type, _ = mimetypes.guess_type(requested_object_name)
        media_type = guessed_type or content_type or "application/octet-stream"
        filename = os.path.basename(requested_object_name)

        return {
            "content": data,
            "media_type": media_type,
            "filename": filename,
        }

    # ==================== Projects CRUD ====================

    @staticmethod
    async def create_project(db: AsyncSession, current_user_id: uuid.UUID, data) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)
        
        from app.models.student_project import StudentProject
        
        project = StudentProject(
            student_id=student.id,
            title=data.title,
            role=data.role,
            organization=data.organization,
            start_date=data.start_date,
            end_date=data.end_date,
            is_ongoing=data.is_ongoing,
            technologies=json.dumps(data.technologies),
            description=data.description,
            impact=data.impact,
            project_url=data.project_url,
            repository_url=data.repository_url,
        )
        db.add(project)
        await db.commit()
        await db.refresh(project)
        
        return {
            "id": str(project.id),
            "student_id": str(project.student_id),
            "title": project.title,
            "role": project.role,
            "organization": project.organization,
            "start_date": project.start_date,
            "end_date": project.end_date,
            "is_ongoing": project.is_ongoing,
            "technologies": json.loads(project.technologies),
            "description": project.description,
            "impact": project.impact,
            "project_url": project.project_url,
            "repository_url": project.repository_url,
        }

    @staticmethod
    async def list_projects(db: AsyncSession, current_user_id: uuid.UUID) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)
        
        from app.models.student_project import StudentProject
        
        result = await db.execute(
            select(StudentProject)
            .where(StudentProject.student_id == student.id)
            .order_by(StudentProject.created_at.desc())
        )
        projects = result.scalars().all()
        
        return {
            "projects": [
                {
                    "id": str(p.id),
                    "student_id": str(p.student_id),
                    "title": p.title,
                    "role": p.role,
                    "organization": p.organization,
                    "start_date": p.start_date,
                    "end_date": p.end_date,
                    "is_ongoing": p.is_ongoing,
                    "technologies": json.loads(p.technologies),
                    "description": p.description,
                    "impact": p.impact,
                    "project_url": p.project_url,
                    "repository_url": p.repository_url,
                }
                for p in projects
            ]
        }

    @staticmethod
    async def get_project(db: AsyncSession, current_user_id: uuid.UUID, project_id: uuid.UUID) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)
        
        from app.models.student_project import StudentProject
        
        result = await db.execute(
            select(StudentProject)
            .where(StudentProject.student_id == student.id)
            .where(StudentProject.id == project_id)
        )
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(404, "Project not found")
        
        return {
            "id": str(project.id),
            "student_id": str(project.student_id),
            "title": project.title,
            "role": project.role,
            "organization": project.organization,
            "start_date": project.start_date,
            "end_date": project.end_date,
            "is_ongoing": project.is_ongoing,
            "technologies": json.loads(project.technologies),
            "description": project.description,
            "impact": project.impact,
            "project_url": project.project_url,
            "repository_url": project.repository_url,
        }

    @staticmethod
    async def update_project(db: AsyncSession, current_user_id: uuid.UUID, project_id: uuid.UUID, data) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)
        
        from app.models.student_project import StudentProject
        
        result = await db.execute(
            select(StudentProject)
            .where(StudentProject.student_id == student.id)
            .where(StudentProject.id == project_id)
        )
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(404, "Project not found")
        
        if data.title is not None:
            project.title = data.title
        if data.role is not None:
            project.role = data.role
        if data.organization is not None:
            project.organization = data.organization
        if data.start_date is not None:
            project.start_date = data.start_date
        if data.end_date is not None:
            project.end_date = data.end_date
        if data.is_ongoing is not None:
            project.is_ongoing = data.is_ongoing
        if data.technologies is not None:
            project.technologies = json.dumps(data.technologies)
        if data.description is not None:
            project.description = data.description
        if data.impact is not None:
            project.impact = data.impact
        if data.project_url is not None:
            project.project_url = data.project_url
        if data.repository_url is not None:
            project.repository_url = data.repository_url
        
        await db.commit()
        await db.refresh(project)
        
        return {
            "id": str(project.id),
            "student_id": str(project.student_id),
            "title": project.title,
            "role": project.role,
            "organization": project.organization,
            "start_date": project.start_date,
            "end_date": project.end_date,
            "is_ongoing": project.is_ongoing,
            "technologies": json.loads(project.technologies),
            "description": project.description,
            "impact": project.impact,
            "project_url": project.project_url,
            "repository_url": project.repository_url,
        }

    @staticmethod
    async def delete_project(db: AsyncSession, current_user_id: uuid.UUID, project_id: uuid.UUID) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)
        
        from app.models.student_project import StudentProject
        
        result = await db.execute(
            select(StudentProject)
            .where(StudentProject.student_id == student.id)
            .where(StudentProject.id == project_id)
        )
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(404, "Project not found")
        
        await db.delete(project)
        await db.commit()
        
        return {"message": "Project deleted successfully"}

    # ==================== Certifications CRUD ====================

    @staticmethod
    async def create_certification(db: AsyncSession, current_user_id: uuid.UUID, data) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)
        
        from app.models.student_certification import StudentCertification
        
        certification = StudentCertification(
            student_id=student.id,
            name=data.name,
            issuer=data.issuer,
            issue_date=data.issue_date,
            expiry_date=data.expiry_date,
            no_expiry=data.no_expiry,
            credential_id=data.credential_id,
            credential_url=data.credential_url,
            skills_covered=json.dumps(data.skills_covered or []),
        )
        db.add(certification)
        await db.commit()
        await db.refresh(certification)
        
        return {
            "id": str(certification.id),
            "student_id": str(certification.student_id),
            "name": certification.name,
            "issuer": certification.issuer,
            "issue_date": certification.issue_date,
            "expiry_date": certification.expiry_date,
            "no_expiry": certification.no_expiry,
            "credential_id": certification.credential_id,
            "credential_url": certification.credential_url,
            "skills_covered": json.loads(certification.skills_covered),
        }

    @staticmethod
    async def list_certifications(db: AsyncSession, current_user_id: uuid.UUID) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)
        
        from app.models.student_certification import StudentCertification
        
        result = await db.execute(
            select(StudentCertification)
            .where(StudentCertification.student_id == student.id)
            .order_by(StudentCertification.created_at.desc())
        )
        certifications = result.scalars().all()
        
        return {
            "certifications": [
                {
                    "id": str(c.id),
                    "student_id": str(c.student_id),
                    "name": c.name,
                    "issuer": c.issuer,
                    "issue_date": c.issue_date,
                    "expiry_date": c.expiry_date,
                    "no_expiry": c.no_expiry,
                    "credential_id": c.credential_id,
                    "credential_url": c.credential_url,
                    "skills_covered": json.loads(c.skills_covered),
                }
                for c in certifications
            ]
        }

    @staticmethod
    async def get_certification(db: AsyncSession, current_user_id: uuid.UUID, certification_id: uuid.UUID) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)
        
        from app.models.student_certification import StudentCertification
        
        result = await db.execute(
            select(StudentCertification)
            .where(StudentCertification.student_id == student.id)
            .where(StudentCertification.id == certification_id)
        )
        certification = result.scalar_one_or_none()
        
        if not certification:
            raise HTTPException(404, "Certification not found")
        
        return {
            "id": str(certification.id),
            "student_id": str(certification.student_id),
            "name": certification.name,
            "issuer": certification.issuer,
            "issue_date": certification.issue_date,
            "expiry_date": certification.expiry_date,
            "no_expiry": certification.no_expiry,
            "credential_id": certification.credential_id,
            "credential_url": certification.credential_url,
            "skills_covered": json.loads(certification.skills_covered),
        }

    @staticmethod
    async def update_certification(db: AsyncSession, current_user_id: uuid.UUID, certification_id: uuid.UUID, data) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)
        
        from app.models.student_certification import StudentCertification
        
        result = await db.execute(
            select(StudentCertification)
            .where(StudentCertification.student_id == student.id)
            .where(StudentCertification.id == certification_id)
        )
        certification = result.scalar_one_or_none()
        
        if not certification:
            raise HTTPException(404, "Certification not found")
        
        if data.name is not None:
            certification.name = data.name
        if data.issuer is not None:
            certification.issuer = data.issuer
        if data.issue_date is not None:
            certification.issue_date = data.issue_date
        if data.expiry_date is not None:
            certification.expiry_date = data.expiry_date
        if data.no_expiry is not None:
            certification.no_expiry = data.no_expiry
        if data.credential_id is not None:
            certification.credential_id = data.credential_id
        if data.credential_url is not None:
            certification.credential_url = data.credential_url
        if data.skills_covered is not None:
            certification.skills_covered = json.dumps(data.skills_covered)
        
        await db.commit()
        await db.refresh(certification)
        
        return {
            "id": str(certification.id),
            "student_id": str(certification.student_id),
            "name": certification.name,
            "issuer": certification.issuer,
            "issue_date": certification.issue_date,
            "expiry_date": certification.expiry_date,
            "no_expiry": certification.no_expiry,
            "credential_id": certification.credential_id,
            "credential_url": certification.credential_url,
            "skills_covered": json.loads(certification.skills_covered),
        }

    @staticmethod
    async def delete_certification(db: AsyncSession, current_user_id: uuid.UUID, certification_id: uuid.UUID) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)
        
        from app.models.student_certification import StudentCertification
        
        result = await db.execute(
            select(StudentCertification)
            .where(StudentCertification.student_id == student.id)
            .where(StudentCertification.id == certification_id)
        )
        certification = result.scalar_one_or_none()
        
        if not certification:
            raise HTTPException(404, "Certification not found")
        
        await db.delete(certification)
        await db.commit()
        
        return {"message": "Certification deleted successfully"}

    # ==================== Skills CRUD ====================

    @staticmethod
    async def create_skill(db: AsyncSession, current_user_id: uuid.UUID, data) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)
        
        # Check if skill already exists
        result = await db.execute(
            select(StudentSkill)
            .where(StudentSkill.student_id == student.id)
            .where(StudentSkill.skill_name.ilike(data.skill_name))
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            raise HTTPException(400, "Skill already exists")
        
        skill = StudentSkill(
            student_id=student.id,
            skill_name=data.skill_name,
            proficiency=data.proficiency,
            years_of_experience=data.years_of_experience,
        )
        db.add(skill)
        await db.commit()
        await db.refresh(skill)
        
        return {
            "id": str(skill.id),
            "student_id": str(skill.student_id),
            "skill_name": skill.skill_name,
            "proficiency": skill.proficiency,
            "years_of_experience": skill.years_of_experience,
            "endorsement_count": skill.endorsement_count,
        }

    @staticmethod
    async def list_skills(db: AsyncSession, current_user_id: uuid.UUID) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)
        
        result = await db.execute(
            select(StudentSkill)
            .where(StudentSkill.student_id == student.id)
            .order_by(StudentSkill.skill_name.asc())
        )
        skills = result.scalars().all()
        
        return {
            "skills": [
                {
                    "id": str(s.id),
                    "student_id": str(s.student_id),
                    "skill_name": s.skill_name,
                    "proficiency": s.proficiency,
                    "years_of_experience": s.years_of_experience,
                    "endorsement_count": s.endorsement_count,
                }
                for s in skills
            ]
        }

    @staticmethod
    async def get_skill(db: AsyncSession, current_user_id: uuid.UUID, skill_id: uuid.UUID) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)
        
        result = await db.execute(
            select(StudentSkill)
            .where(StudentSkill.student_id == student.id)
            .where(StudentSkill.id == skill_id)
        )
        skill = result.scalar_one_or_none()
        
        if not skill:
            raise HTTPException(404, "Skill not found")
        
        return {
            "id": str(skill.id),
            "student_id": str(skill.student_id),
            "skill_name": skill.skill_name,
            "proficiency": skill.proficiency,
            "years_of_experience": skill.years_of_experience,
            "endorsement_count": skill.endorsement_count,
        }

    @staticmethod
    async def update_skill(db: AsyncSession, current_user_id: uuid.UUID, skill_id: uuid.UUID, data) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)
        
        result = await db.execute(
            select(StudentSkill)
            .where(StudentSkill.student_id == student.id)
            .where(StudentSkill.id == skill_id)
        )
        skill = result.scalar_one_or_none()
        
        if not skill:
            raise HTTPException(404, "Skill not found")
        
        if data.skill_name is not None:
            skill.skill_name = data.skill_name
        if data.proficiency is not None:
            skill.proficiency = data.proficiency
        if data.years_of_experience is not None:
            skill.years_of_experience = data.years_of_experience
        if data.endorsement_count is not None:
            skill.endorsement_count = data.endorsement_count
        
        await db.commit()
        await db.refresh(skill)
        
        return {
            "id": str(skill.id),
            "student_id": str(skill.student_id),
            "skill_name": skill.skill_name,
            "proficiency": skill.proficiency,
            "years_of_experience": skill.years_of_experience,
            "endorsement_count": skill.endorsement_count,
        }

    @staticmethod
    async def delete_skill(db: AsyncSession, current_user_id: uuid.UUID, skill_id: uuid.UUID) -> dict:
        student, _ = await StudentService._get_student_or_404(db, current_user_id)
        
        result = await db.execute(
            select(StudentSkill)
            .where(StudentSkill.student_id == student.id)
            .where(StudentSkill.id == skill_id)
        )
        skill = result.scalar_one_or_none()
        
        if not skill:
            raise HTTPException(404, "Skill not found")
        
        await db.delete(skill)
        await db.commit()
        
        return {"message": "Skill deleted successfully"}
