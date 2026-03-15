import uuid

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.permissions import require_roles
from app.schemas.tpo_schema import (
    ApplicationStatusOverrideRequest,
    EligibilitySnapshotResponse,
    MaterialCategory,
    MaterialUpdateRequest,
    ReportType,
    StudentBulkUploadResult,
    StudentCreateByTPORequest,
    StudentPasswordResetByTPORequest,
    StudentProfileUpdateByTPORequest,
)
from app.services.tpo_service import TPOService

router = APIRouter(prefix="/tpo", tags=["TPO"])
_tpo_only = Depends(require_roles("TPO"))


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
