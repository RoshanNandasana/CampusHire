import uuid

import fastapi
import sqlalchemy.ext.asyncio

from app.core.db import get_db
from app.core.permissions import require_roles
from app.schemas.student_schema import StudentProfileUpdateRequest
from app.schemas.student_profile_schema import (
    StudentProjectCreate,
    StudentProjectUpdate,
    StudentProjectResponse,
    StudentCertificationCreate,
    StudentCertificationUpdate,
    StudentCertificationResponse,
    StudentSkillCreate,
    StudentSkillUpdate,
    StudentSkillResponse,
)
from app.services.student_service import StudentService


router = fastapi.APIRouter(prefix="/student", tags=["Student"])
_student_only = fastapi.Depends(require_roles("STUDENT"))


@router.get("/dashboard")
async def get_dashboard(
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.get_dashboard(db, current_user.id)


@router.get("/profile")
async def get_profile(
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.get_profile(db, current_user.id)


@router.put("/profile")
async def update_profile(
    data: StudentProfileUpdateRequest,
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.update_profile(db, current_user.id, data)


@router.get("/jobs")
async def list_jobs(
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.list_jobs(db, current_user.id)


@router.post("/apply/{job_id}")
async def apply_for_job(
    job_id: uuid.UUID,
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.apply_for_job(db, current_user.id, job_id)


@router.get("/applications")
async def list_applications(
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.list_applications(db, current_user.id)


@router.get("/applications/{application_id}")
async def get_application_status(
    application_id: uuid.UUID,
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.get_application_status(db, current_user.id, application_id)


@router.get("/resume-insights")
async def get_resume_insights(
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.get_resume_insights(db, current_user.id)


@router.post("/resume-upload")
async def upload_resume(
    resume: fastapi.UploadFile = fastapi.File(...),
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.upload_resume(db, current_user.id, resume)


@router.get("/materials")
async def list_materials(
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.list_materials(db, current_user.id)


# ==================== Projects CRUD ====================

@router.post("/projects", response_model=StudentProjectResponse, status_code=201)
async def create_project(
    data: StudentProjectCreate,
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.create_project(db, current_user.id, data)


@router.get("/projects")
async def list_projects(
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.list_projects(db, current_user.id)


@router.get("/projects/{project_id}", response_model=StudentProjectResponse)
async def get_project(
    project_id: uuid.UUID,
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.get_project(db, current_user.id, project_id)


@router.put("/projects/{project_id}", response_model=StudentProjectResponse)
async def update_project(
    project_id: uuid.UUID,
    data: StudentProjectUpdate,
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.update_project(db, current_user.id, project_id, data)


@router.delete("/projects/{project_id}")
async def delete_project(
    project_id: uuid.UUID,
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.delete_project(db, current_user.id, project_id)


# ==================== Certifications CRUD ====================

@router.post("/certifications", response_model=StudentCertificationResponse, status_code=201)
async def create_certification(
    data: StudentCertificationCreate,
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.create_certification(db, current_user.id, data)


@router.get("/certifications")
async def list_certifications(
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.list_certifications(db, current_user.id)


@router.get("/certifications/{certification_id}", response_model=StudentCertificationResponse)
async def get_certification(
    certification_id: uuid.UUID,
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.get_certification(db, current_user.id, certification_id)


@router.put("/certifications/{certification_id}", response_model=StudentCertificationResponse)
async def update_certification(
    certification_id: uuid.UUID,
    data: StudentCertificationUpdate,
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.update_certification(db, current_user.id, certification_id, data)


@router.delete("/certifications/{certification_id}")
async def delete_certification(
    certification_id: uuid.UUID,
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.delete_certification(db, current_user.id, certification_id)


# ==================== Skills CRUD ====================

@router.post("/skills", response_model=StudentSkillResponse, status_code=201)
async def create_skill(
    data: StudentSkillCreate,
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.create_skill(db, current_user.id, data)


@router.get("/skills")
async def list_skills(
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.list_skills(db, current_user.id)


@router.get("/skills/{skill_id}", response_model=StudentSkillResponse)
async def get_skill(
    skill_id: uuid.UUID,
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.get_skill(db, current_user.id, skill_id)


@router.put("/skills/{skill_id}", response_model=StudentSkillResponse)
async def update_skill(
    skill_id: uuid.UUID,
    data: StudentSkillUpdate,
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.update_skill(db, current_user.id, skill_id, data)


@router.delete("/skills/{skill_id}")
async def delete_skill(
    skill_id: uuid.UUID,
    db: sqlalchemy.ext.asyncio.AsyncSession = fastapi.Depends(get_db),
    current_user=_student_only,
):
    return await StudentService.delete_skill(db, current_user.id, skill_id)
