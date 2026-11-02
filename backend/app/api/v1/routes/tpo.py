import uuid
from io import BytesIO

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.permissions import require_roles
from app.schemas.tpo_schema import (
    ApplicationStatusOverrideRequest,
    EligibilitySnapshotResponse,
    JobApprovalUpdateRequest,
    MaterialCategory,
    MaterialUpdateRequest,
    ReportType,
    StudentBulkUploadResult,
    StudentCreateByTPORequest,
    StudentPasswordResetByTPORequest,
    StudentProfileUpdateByTPORequest,
)
from app.services.tpo_service import TPOService
from app.repositories import tpo_feature_repo
from app.models.job_application import JobApplication
from app.models.jobs import Job
from app.models.company import Company
from app.models.students import Student
from app.models.user import User
from app.models.departments import Department

router = APIRouter(prefix="/tpo", tags=["TPO"])
_tpo_only = Depends(require_roles("TPO"))


@router.get("/dashboard")
async def tpo_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_only,
):
    dashboard = await TPOService.get_reports_dashboard(db, current_user.id)
    placement = dashboard.get("placement_stats", {})
    return {
        "stats": {
            "totalStudents": placement.get("total_students", 0),
            "placedStudents": placement.get("placed_count", 0),
            "placementRate": placement.get("placement_percentage", 0),
            "avgCtcLpa": round((placement.get("avg_ctc", 0) or 0) / 100000, 2) if placement.get("avg_ctc") else 0,
        },
        "companyBreakdown": dashboard.get("company_breakdown", []),
        "studentReport": dashboard.get("student_report", []),
    }


@router.get("/students")
async def list_students(
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_only,
):
    return await TPOService.list_students(db, current_user.id)


@router.post("/students", status_code=201)
async def create_student(
    data: StudentCreateByTPORequest,
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_only,
):
    return await TPOService.create_student(db, current_user.id, data)


@router.post("/students/bulk-upload", response_model=StudentBulkUploadResult)
async def bulk_upload_students(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_only,
):
    return await TPOService.bulk_create_students_from_csv(db, current_user.id, file)


@router.put("/students/{student_id}")
async def update_student(
    student_id: uuid.UUID,
    data: StudentProfileUpdateByTPORequest,
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_only,
):
    return await TPOService.update_student_profile(db, current_user.id, student_id, data)


@router.post("/students/{student_id}/reset-password")
async def reset_student_password(
    student_id: uuid.UUID,
    data: StudentPasswordResetByTPORequest,
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_only,
):
    return await TPOService.reset_student_password(db, current_user.id, student_id, data)


@router.get("/students/{student_id}/application-timeline")
async def get_student_timeline(
    student_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_only,
):
    return await TPOService.get_student_timeline(db, current_user.id, student_id)


@router.get("/students/{student_id}/resume-ai-history")
async def get_student_resume_history(
    student_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_only,
):
    return await TPOService.get_student_resume_history(db, current_user.id, student_id)


@router.get("/jobs/active")
async def list_active_jobs(
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_only,
):
    return await TPOService.list_active_jobs(db, current_user.id)


@router.get("/jobs")
async def list_jobs_compat(
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_only,
):
    return await TPOService.list_active_jobs(db, current_user.id)


@router.put("/jobs/{job_id}/approval")
async def update_job_approval_status(
    job_id: uuid.UUID,
    data: JobApprovalUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_only,
):
    return await TPOService.update_job_approval_status(db, current_user.id, job_id, data.status.value)


@router.get("/applications")
async def list_tpo_applications(
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_only,
):
    department_id = await tpo_feature_repo.get_tpo_department_id(db, current_user.id)
    if not department_id:
                return {"applications": []}

    rows = await db.execute(
        select(JobApplication, Student, User, Job, Company, Department)
        .join(Student, Student.id == JobApplication.student_id)
        .join(User, User.id == Student.user_id)
        .join(Job, Job.id == JobApplication.job_id)
        .join(Company, Company.id == Job.company_id)
        .join(Department, Department.id == Student.department_id)
        .where(Student.department_id == department_id)
        .order_by(JobApplication.created_at.desc())
    )

    applications = []
    for application, student, user, job, company, department in rows.all():
        applications.append(
            {
                "id": str(application.id),
                "student": user.email.split("@")[0].replace(".", " ").title(),
                "email": user.email,
                "branch": department.name,
                "cgpa": student.cgpa,
                "company": company.name,
                "position": job.title,
                "status": str(application.status or "").lower(),
                "appliedAt": application.created_at.isoformat() if application.created_at else "",
                "updatedAt": application.updated_at.isoformat() if application.updated_at else "",
                "nextStep": "Recruiter review",
            }
        )

    return {"applications": applications}


@router.get("/analytics")
async def tpo_analytics(
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_only,
):
    return await TPOService.get_reports_dashboard(db, current_user.id)


@router.post("/eligibility-rules")
async def set_eligibility_rules_compat(
    rules: dict,
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_only,
):
    _ = db
    _ = current_user
    return {"message": "Eligibility rules endpoint active", "rules": rules}


@router.post("/applications/{application_id}/override-status")
async def override_application_status(
    application_id: uuid.UUID,
    data: ApplicationStatusOverrideRequest,
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_only,
):
    return await TPOService.override_application_status(db, current_user.id, application_id, data)


@router.get("/applications/{application_id}/eligibility-snapshot", response_model=EligibilitySnapshotResponse)
async def get_eligibility_snapshot(
    application_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_only,
):
    return await TPOService.get_eligibility_snapshot(db, current_user.id, application_id)


@router.post("/materials", status_code=201)
async def upload_material(
    title: str = Form(...),
    category: MaterialCategory = Form(...),
    is_global: bool = Form(False),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_only,
):
    return await TPOService.upload_study_material(
        db,
        current_user.id,
        title,
        category,
        is_global,
        file,
    )


@router.get("/materials")
async def list_materials(
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_only,
):
    return await TPOService.list_study_materials(db, current_user.id)


@router.get("/materials/{material_id}/file")
async def get_material_file(
    material_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_only,
):
    payload = await TPOService.get_study_material_file(db, current_user.id, material_id)
    return StreamingResponse(
        BytesIO(payload["content"]),
        media_type=payload["media_type"],
        headers={"Content-Disposition": f"inline; filename=\"{payload['filename']}\""},
    )


@router.put("/materials/{material_id}")
async def update_material(
    material_id: uuid.UUID,
    data: MaterialUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_only,
):
    return await TPOService.update_study_material(db, current_user.id, material_id, data)


@router.delete("/materials/{material_id}")
async def delete_material(
    material_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_only,
):
    return await TPOService.delete_study_material(db, current_user.id, material_id)


@router.get("/materials/{material_id}/access-logs")
async def material_access_logs(
    material_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_only,
):
    return await TPOService.get_material_access_logs(db, current_user.id, material_id)


@router.get("/materials/minio-objects")
async def list_material_objects_in_minio(
    current_user=_tpo_only,
):
    return await TPOService.list_minio_material_objects()


@router.get("/reports/dashboard")
async def reports_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_only,
):
    return await TPOService.get_reports_dashboard(db, current_user.id)


@router.get("/reports/export")
async def export_reports_csv(
    report_type: ReportType = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_only,
):
    csv_content, filename = await TPOService.export_report_csv(db, current_user.id, report_type)
    return StreamingResponse(
        iter([csv_content]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
