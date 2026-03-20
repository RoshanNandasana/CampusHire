import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.permissions import require_roles
from app.schemas.recruiter_schema import (
    RecruiterApplicationStatusUpdateRequest,
    RecruiterOfferCreateRequest,
    RecruiterOfferStatusUpdateRequest,
    RecruiterPostJobRequest,
)
from app.services.recruiter_service import RecruiterService


router = APIRouter(prefix="/recruiter", tags=["Recruiter"])
_recruiter_only = Depends(require_roles("COMPANY", "RECRUITER"))


@router.get("/dashboard")
async def recruiter_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user=_recruiter_only,
):
    return await RecruiterService.get_dashboard(db, current_user.id)


@router.post("/jobs", status_code=201)
async def post_job(
    data: RecruiterPostJobRequest,
    db: AsyncSession = Depends(get_db),
    current_user=_recruiter_only,
):
    return await RecruiterService.post_job(db, current_user.id, data)


@router.get("/jobs")
async def recruiter_jobs(
    db: AsyncSession = Depends(get_db),
    current_user=_recruiter_only,
):
    return await RecruiterService.get_jobs(db, current_user.id)


@router.get("/applicants")
async def recruiter_applicants(
    db: AsyncSession = Depends(get_db),
    current_user=_recruiter_only,
):
    return await RecruiterService.get_applicants(db, current_user.id)


@router.get("/applicants/{application_id}")
async def recruiter_applicant_profile(
    application_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=_recruiter_only,
):
    data = await RecruiterService.get_applicants(db, current_user.id)
    target = next((item for item in data.get("applications", []) if item.get("id") == str(application_id)), None)
    if not target:
        raise HTTPException(status_code=404, detail="Applicant not found")
    return target


@router.put("/applications/{application_id}")
async def recruiter_update_application_status(
    application_id: uuid.UUID,
    data: RecruiterApplicationStatusUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user=_recruiter_only,
):
    return await RecruiterService.update_application_status(db, current_user.id, application_id, data.status)


@router.post("/offers/{application_id}")
async def recruiter_release_offer(
    application_id: uuid.UUID,
    data: RecruiterOfferCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user=_recruiter_only,
):
    return await RecruiterService.release_offer(
        db,
        current_user.id,
        application_id,
        data.salaryLpa,
        data.status,
        data.offerLetterUrl,
    )


@router.get("/offers")
async def recruiter_offers(
    db: AsyncSession = Depends(get_db),
    current_user=_recruiter_only,
):
    return await RecruiterService.get_offers(db, current_user.id)


@router.put("/offers/{application_id}")
async def recruiter_update_offer_status(
    application_id: uuid.UUID,
    data: RecruiterOfferStatusUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user=_recruiter_only,
):
    return await RecruiterService.update_offer_status(db, current_user.id, application_id, data.status)
