import csv
import io
import secrets
import uuid
from datetime import datetime

from fastapi import HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User
from app.models.jobs import Job
from app.models.job_eligibility import JobEligibility
from app.models.placement_drives import PlacementDrive
from app.repositories import audit_repo, user_repo
from app.repositories import tpo_feature_repo
from app.schemas.tpo_schema import MaterialCategory, ReportType
from app.storage import minio_client


class TPOService:

    @staticmethod
    async def _get_department_id_or_404(db: AsyncSession, current_user_id: uuid.UUID) -> uuid.UUID:
        department_id = await tpo_feature_repo.get_tpo_department_id(db, current_user_id)
        if not department_id:
            raise HTTPException(404, "TPO department mapping not found")
        return department_id

    @staticmethod
    async def list_students(db: AsyncSession, current_user_id: uuid.UUID) -> dict:
        department_id = await TPOService._get_department_id_or_404(db, current_user_id)
        students = await tpo_feature_repo.list_department_students_with_status(db, department_id)
        return {"students": students}

    @staticmethod
    async def create_student(db: AsyncSession, current_user_id: uuid.UUID, data) -> dict:
        department_id = await TPOService._get_department_id_or_404(db, current_user_id)

        existing_user = await user_repo.get_user_by_email(db, data.email)
        if existing_user:
            raise HTTPException(400, "Email already registered")

        existing_student = await tpo_feature_repo.get_student_by_enrollment(db, data.enrollment_number)
        if existing_student:
            raise HTTPException(400, "Enrollment number already exists")

        role = await user_repo.get_role_by_name(db, "STUDENT")
        if not role:
            raise HTTPException(500, "STUDENT role not found")

        generated_password = None
        final_password = data.password
        if not final_password:
            generated_password = secrets.token_urlsafe(10)
            final_password = generated_password

        user = User(
            email=data.email,
            password_hash=hash_password(final_password),
            role_id=role.id,
            is_active=True,
            must_change_password=True,
            token_version=1,
        )
        db.add(user)
        await db.flush()

        student = await tpo_feature_repo.create_student(
            db,
            user_id=user.id,
            department_id=department_id,
            enrollment_number=data.enrollment_number,
            cgpa=data.cgpa,
            tenth_percentage=data.tenth_percentage,
            twelfth_percentage=data.twelfth_percentage,
            backlog_count=data.backlog_count,
        )

        await db.commit()

        await audit_repo.create_log(
            db,
            current_user_id,
            "CREATE_STUDENT",
            "student",
            str(student.id),
            {
                "email": data.email,
                "enrollment_number": data.enrollment_number,
                "department_id": str(department_id),
            },
        )

        return {
            "student_id": student.id,
            "user_id": user.id,
            "email": user.email,
            "enrollment_number": student.enrollment_number,
            "generated_password": generated_password,
        }

    @staticmethod
    async def bulk_create_students_from_csv(
        db: AsyncSession,
        current_user_id: uuid.UUID,
        csv_file: UploadFile,
    ) -> dict:
        department_id = await TPOService._get_department_id_or_404(db, current_user_id)

        file_bytes = await csv_file.read()
        try:
            file_text = file_bytes.decode("utf-8-sig")
        except UnicodeDecodeError as exc:
            raise HTTPException(400, "CSV file must be UTF-8 encoded") from exc

        reader = csv.DictReader(io.StringIO(file_text))
        required_columns = {
            "email",
            "password",
            "enrollment_number",
            "cgpa",
            "tenth_percentage",
            "twelfth_percentage",
            "backlog_count",
        }
        if not reader.fieldnames or not required_columns.issubset(set(reader.fieldnames)):
            raise HTTPException(
                400,
                "CSV must include columns: email,password,enrollment_number,cgpa,tenth_percentage,twelfth_percentage,backlog_count",
            )

        created_students = []
        errors = []

        role = await user_repo.get_role_by_name(db, "STUDENT")
        if not role:
            raise HTTPException(500, "STUDENT role not found")

        for idx, row in enumerate(reader, start=2):
            email = (row.get("email") or "").strip().lower()
            enrollment_number = (row.get("enrollment_number") or "").strip()
            raw_password = (row.get("password") or "").strip()
            generated_password = None

            if not email or not enrollment_number:
                errors.append({"line": idx, "error": "email and enrollment_number are required"})
                continue

            try:
                cgpa = float(row.get("cgpa") or 0)
                tenth_percentage = float(row.get("tenth_percentage") or 0)
                twelfth_percentage = float(row.get("twelfth_percentage") or 0)
                backlog_count = int(row.get("backlog_count") or 0)
            except ValueError:
                errors.append({"line": idx, "error": "numeric fields are invalid"})
                continue

            if cgpa < 0 or cgpa > 10:
                errors.append({"line": idx, "error": "cgpa must be between 0 and 10"})
                continue

            if tenth_percentage < 0 or tenth_percentage > 100 or twelfth_percentage < 0 or twelfth_percentage > 100:
                errors.append({"line": idx, "error": "percentage fields must be between 0 and 100"})
                continue

            if backlog_count < 0:
                errors.append({"line": idx, "error": "backlog_count must be >= 0"})
                continue

            existing_user = await user_repo.get_user_by_email(db, email)
            if existing_user:
                errors.append({"line": idx, "error": f"email already exists: {email}"})
                continue

            existing_student = await tpo_feature_repo.get_student_by_enrollment(db, enrollment_number)
            if existing_student:
                errors.append({"line": idx, "error": f"enrollment already exists: {enrollment_number}"})
                continue

            final_password = raw_password
            if not final_password:
                generated_password = secrets.token_urlsafe(10)
                final_password = generated_password

            user = User(
                email=email,
                password_hash=hash_password(final_password),
                role_id=role.id,
                is_active=True,
                must_change_password=True,
                token_version=1,
            )
            db.add(user)
            await db.flush()

            student = await tpo_feature_repo.create_student(
                db,
                user_id=user.id,
                department_id=department_id,
                enrollment_number=enrollment_number,
                cgpa=cgpa,
                tenth_percentage=tenth_percentage,
                twelfth_percentage=twelfth_percentage,
                backlog_count=backlog_count,
            )

            created_students.append(
                {
                    "student_id": student.id,
                    "user_id": user.id,
                    "email": email,
                    "enrollment_number": enrollment_number,
                    "generated_password": generated_password,
                }
            )

        await db.commit()

        await audit_repo.create_log(
            db,
            current_user_id,
            "BULK_CREATE_STUDENTS",
            "student",
            str(department_id),
            {
                "department_id": str(department_id),
                "created_count": len(created_students),
                "failed_count": len(errors),
            },
        )

        return {
            "created_count": len(created_students),
            "failed_count": len(errors),
            "created_students": created_students,
            "errors": errors,
        }

    @staticmethod
    async def update_student_profile(
        db: AsyncSession,
        current_user_id: uuid.UUID,
        student_id: uuid.UUID,
        data,
    ) -> dict:
        department_id = await TPOService._get_department_id_or_404(db, current_user_id)
        student = await tpo_feature_repo.get_student_by_id_in_department(db, student_id, department_id)
        if not student:
            raise HTTPException(404, "Student not found in your department")

        await tpo_feature_repo.update_student_profile(
            db,
            student,
            cgpa=data.cgpa,
            backlog_count=data.backlog_count,
            tenth_percentage=data.tenth_percentage,
            twelfth_percentage=data.twelfth_percentage,
        )
        await db.commit()

        await audit_repo.create_log(
            db,
            current_user_id,
            "UPDATE_STUDENT_PROFILE",
            "student",
            str(student_id),
            {
                "cgpa": data.cgpa,
                "backlog_count": data.backlog_count,
                "tenth_percentage": data.tenth_percentage,
                "twelfth_percentage": data.twelfth_percentage,
            },
        )

        return {"message": "Student profile updated"}

    @staticmethod
    async def reset_student_password(
        db: AsyncSession,
        current_user_id: uuid.UUID,
        student_id: uuid.UUID,
        data,
    ) -> dict:
        department_id = await TPOService._get_department_id_or_404(db, current_user_id)
        student = await tpo_feature_repo.get_student_by_id_in_department(db, student_id, department_id)
        if not student:
            raise HTTPException(404, "Student not found in your department")

        generated_password = None
        password = data.new_password
        if not password:
            generated_password = secrets.token_urlsafe(10)
            password = generated_password

        user = await user_repo.reset_password(db, student.user_id, hash_password(password))
        if not user:
            raise HTTPException(404, "Student user account not found")

        await audit_repo.create_log(
            db,
            current_user_id,
            "RESET_STUDENT_PASSWORD",
            "student",
            str(student_id),
            {},
        )

        return {
            "message": "Student password reset",
            "generated_password": generated_password,
        }

    @staticmethod
    async def get_student_timeline(db: AsyncSession, current_user_id: uuid.UUID, student_id: uuid.UUID) -> dict:
        department_id = await TPOService._get_department_id_or_404(db, current_user_id)
        student = await tpo_feature_repo.get_student_by_id_in_department(db, student_id, department_id)
        if not student:
            raise HTTPException(404, "Student not found in your department")
        return await tpo_feature_repo.get_student_timeline(db, student.id)

    @staticmethod
    async def get_student_resume_history(db: AsyncSession, current_user_id: uuid.UUID, student_id: uuid.UUID) -> dict:
        department_id = await TPOService._get_department_id_or_404(db, current_user_id)
        student = await tpo_feature_repo.get_student_by_id_in_department(db, student_id, department_id)
        if not student:
            raise HTTPException(404, "Student not found in your department")
        return await tpo_feature_repo.get_student_resume_analysis_history(db, student.id)

    @staticmethod
    async def list_active_jobs(db: AsyncSession, current_user_id: uuid.UUID) -> dict:
        department_id = await TPOService._get_department_id_or_404(db, current_user_id)
        jobs = await tpo_feature_repo.list_active_jobs_for_department(db, department_id)
        return {"jobs": jobs}

    @staticmethod
    async def update_job_approval_status(
        db: AsyncSession,
        current_user_id: uuid.UUID,
        job_id: uuid.UUID,
        status: str,
    ) -> dict:
        department_id = await TPOService._get_department_id_or_404(db, current_user_id)

        row = await db.execute(
            select(Job, PlacementDrive)
            .join(JobEligibility, JobEligibility.job_id == Job.id)
            .outerjoin(PlacementDrive, PlacementDrive.id == Job.drive_id)
            .where(Job.id == job_id)
            .where(JobEligibility.department_id == department_id)
        )
        data = row.one_or_none()
        if not data:
            raise HTTPException(404, "Job not found in your department scope")

        job, drive = data
        normalized_status = (status or "PENDING").upper()

        if drive is None:
            drive = PlacementDrive(
                company_id=job.company_id,
                name=f"{job.title} Drive",
                drive_date=job.application_deadline,
                registration_deadline=job.application_deadline,
                status=normalized_status,
            )
            db.add(drive)
            await db.flush()
            job.drive_id = drive.id
        else:
            drive.status = normalized_status

        await db.commit()

        await audit_repo.create_log(
            db,
            current_user_id,
            "UPDATE_JOB_APPROVAL_STATUS",
            "job",
            str(job_id),
            {"status": normalized_status},
        )

        return {"message": "Job approval status updated", "job_id": job.id, "status": normalized_status}

    @staticmethod
    async def override_application_status(
        db: AsyncSession,
        current_user_id: uuid.UUID,
        application_id: uuid.UUID,
        data,
    ) -> dict:
        department_id = await TPOService._get_department_id_or_404(db, current_user_id)
        application = await tpo_feature_repo.get_application_in_department(db, application_id, department_id)
        if not application:
            raise HTTPException(404, "Application not found in your department")

        old_status = application.status
        application.status = data.new_status.value
        await db.commit()

        await audit_repo.create_log(
            db,
            current_user_id,
            "OVERRIDE_APPLICATION_STATUS",
            "job_application",
            str(application_id),
            {
                "old_status": old_status,
                "new_status": data.new_status.value,
                "reason": data.reason,
            },
        )

        return {
            "application_id": application.id,
            "old_status": old_status,
            "new_status": application.status,
            "reason": data.reason,
        }

    @staticmethod
    async def get_eligibility_snapshot(
        db: AsyncSession,
        current_user_id: uuid.UUID,
        application_id: uuid.UUID,
    ) -> dict:
        department_id = await TPOService._get_department_id_or_404(db, current_user_id)
        application = await tpo_feature_repo.get_application_in_department(db, application_id, department_id)
        if not application:
            raise HTTPException(404, "Application not found in your department")

        snapshot = await tpo_feature_repo.get_or_create_eligibility_snapshot(db, application)
        await db.commit()

        return {
            "application_id": snapshot.application_id,
            "student_id": snapshot.student_id,
            "job_id": snapshot.job_id,
            "department_id": snapshot.department_id,
            "min_cgpa": snapshot.min_cgpa,
            "max_backlogs": snapshot.max_backlogs,
            "student_cgpa": snapshot.student_cgpa,
            "student_backlogs": snapshot.student_backlogs,
            "is_eligible": snapshot.is_eligible,
            "captured_at": snapshot.captured_at,
        }

    @staticmethod
    async def upload_study_material(
        db: AsyncSession,
        current_user_id: uuid.UUID,
        title: str,
        category: MaterialCategory,
        is_global: bool,
        file: UploadFile,
    ) -> dict:
        department_id = await TPOService._get_department_id_or_404(db, current_user_id)

        content = await file.read()
        if not content:
            raise HTTPException(400, "Uploaded file is empty")

        object_name = f"materials/{department_id}/{uuid.uuid4().hex}_{file.filename}"
        minio_client.upload_bytes(
            settings.minio_bucket_materials,
            object_name,
            content,
            file.content_type or "application/octet-stream",
        )
        file_url = minio_client.build_file_url(settings.minio_bucket_materials, object_name)

        material = await tpo_feature_repo.create_study_material(
            db,
            title=title,
            category=category.value,
            file_url=file_url,
            created_by=current_user_id,
            is_global=is_global,
            department_id=None if is_global else department_id,
        )
        await db.commit()

        await audit_repo.create_log(
            db,
            current_user_id,
            "UPLOAD_STUDY_MATERIAL",
            "study_material",
            str(material.id),
            {
                "title": title,
                "category": category.value,
                "is_global": is_global,
            },
        )

        return {
            "id": material.id,
            "title": material.title,
            "category": material.category,
            "file_url": material.file_url,
            "is_global": material.is_global,
            "department_id": material.department_id,
            "created_by": material.created_by,
            "created_at": material.created_at,
            "updated_at": material.updated_at,
            "total_access_count": 0,
            "download_count": 0,
        }

    @staticmethod
    async def list_study_materials(db: AsyncSession, current_user_id: uuid.UUID) -> dict:
        department_id = await TPOService._get_department_id_or_404(db, current_user_id)
        materials = await tpo_feature_repo.list_study_materials_for_department(db, department_id)
        return {"materials": materials}

    @staticmethod
    async def update_study_material(
        db: AsyncSession,
        current_user_id: uuid.UUID,
        material_id: uuid.UUID,
        data,
    ) -> dict:
        department_id = await TPOService._get_department_id_or_404(db, current_user_id)
        material = await tpo_feature_repo.get_study_material(db, material_id)
        if not material:
            raise HTTPException(404, "Material not found")

        if material.created_by != current_user_id:
            raise HTTPException(403, "You can edit only materials uploaded by you")

        updated = await tpo_feature_repo.update_study_material(
            db,
            material,
            title=data.title,
            category=data.category.value if data.category else None,
            is_global=data.is_global,
            department_id=department_id,
        )
        await db.commit()

        await audit_repo.create_log(
            db,
            current_user_id,
            "UPDATE_STUDY_MATERIAL",
            "study_material",
            str(material_id),
            {},
        )

        return {
            "id": updated.id,
            "title": updated.title,
            "category": updated.category,
            "file_url": updated.file_url,
            "is_global": updated.is_global,
            "department_id": updated.department_id,
            "created_by": updated.created_by,
            "created_at": updated.created_at,
            "updated_at": updated.updated_at,
        }

    @staticmethod
    async def delete_study_material(db: AsyncSession, current_user_id: uuid.UUID, material_id: uuid.UUID) -> dict:
        material = await tpo_feature_repo.get_study_material(db, material_id)
        if not material:
            raise HTTPException(404, "Material not found")

        if material.created_by != current_user_id:
            raise HTTPException(403, "You can delete only materials uploaded by you")

        object_name = material.file_url.split(f"/{settings.minio_bucket_materials}/", maxsplit=1)
        if len(object_name) == 2:
            minio_client.delete_object(settings.minio_bucket_materials, object_name[1])

        await tpo_feature_repo.delete_study_material(db, material)
        await db.commit()

        await audit_repo.create_log(
            db,
            current_user_id,
            "DELETE_STUDY_MATERIAL",
            "study_material",
            str(material_id),
            {},
        )

        return {"message": "Material deleted"}

    @staticmethod
    async def get_material_access_logs(db: AsyncSession, current_user_id: uuid.UUID, material_id: uuid.UUID) -> dict:
        _ = await TPOService._get_department_id_or_404(db, current_user_id)
        material = await tpo_feature_repo.get_study_material(db, material_id)
        if not material:
            raise HTTPException(404, "Material not found")

        logs = await tpo_feature_repo.get_material_access_logs(db, material_id)
        return {"material_id": material_id, "access_logs": logs}

    @staticmethod
    async def list_minio_material_objects() -> dict:
        objects = minio_client.list_objects(settings.minio_bucket_materials, prefix="materials/")
        return {"bucket": settings.minio_bucket_materials, "objects": objects}

    @staticmethod
    async def get_reports_dashboard(db: AsyncSession, current_user_id: uuid.UUID) -> dict:
        department_id = await TPOService._get_department_id_or_404(db, current_user_id)

        placement_stats = await tpo_feature_repo.get_placement_stats_for_department(db, department_id)
        company_breakdown = await tpo_feature_repo.get_company_breakdown_for_department(db, department_id)
        student_report = await tpo_feature_repo.get_student_report_for_department(db, department_id)

        return {
            "placement_stats": placement_stats,
            "company_breakdown": company_breakdown,
            "student_report": student_report,
        }

    @staticmethod
    async def export_report_csv(
        db: AsyncSession,
        current_user_id: uuid.UUID,
        report_type: ReportType,
    ) -> tuple[str, str]:
        department_id = await TPOService._get_department_id_or_404(db, current_user_id)
        output = io.StringIO()

        if report_type == ReportType.PLACEMENT:
            data = await tpo_feature_repo.get_placement_stats_for_department(db, department_id)
            writer = csv.DictWriter(
                output,
                fieldnames=[
                    "cycle_id",
                    "cycle_name",
                    "placed_count",
                    "placement_percentage",
                    "avg_ctc",
                    "total_students",
                ],
            )
            writer.writeheader()
            writer.writerow(data)
            return output.getvalue(), "placement_report.csv"

        if report_type == ReportType.COMPANY:
            data = await tpo_feature_repo.get_company_breakdown_for_department(db, department_id)
            writer = csv.DictWriter(
                output,
                fieldnames=["company_id", "company_name", "jobs_posted", "offers_made", "offers_accepted"],
            )
            writer.writeheader()
            writer.writerows(data)
            return output.getvalue(), "company_report.csv"

        data = await tpo_feature_repo.get_student_report_for_department(db, department_id)
        writer = csv.DictWriter(
            output,
            fieldnames=[
                "student_id",
                "enrollment_number",
                "email",
                "cgpa",
                "backlog_count",
                "application_count",
                "latest_interview_stage",
                "final_status",
                "placed_company",
            ],
        )
        writer.writeheader()
        writer.writerows(data)
        return output.getvalue(), "student_report.csv"
