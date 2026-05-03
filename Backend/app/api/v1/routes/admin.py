"""
Super Admin routes.
All endpoints require the SUPER_ADMIN role except the two TPO-readable ones
(GET /tpos  and  GET /analytics) which are marked separately.
"""
import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.permissions import require_roles
from app.core.cache import get_cache_stats, clear_all_caches, reset_cache_stats
from app.schemas.admin_schema import (
    CreateTPORequest,
    UpdateTPORequest,
    CreateCompanyRequest,
    UpdateCompanyRequest,
    CreateCycleRequest,
    EnrollDepartmentRequest,
    ResetPasswordRequest,
    OfferOverrideRequest,
    SystemConfigUpdate,
)
from app.schemas.departments_schema import DepartmentCreate, DepartmentUpdate
from app.services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["Admin"])

_super_admin = Depends(require_roles("SUPER_ADMIN"))
_tpo_or_admin = Depends(require_roles("SUPER_ADMIN", "TPO"))


# ── TPO Coordinators ─────────────────────────────────────────────────────────

@router.post("/tpos", status_code=201)
async def create_tpo(
    data: CreateTPORequest,
    db: AsyncSession = Depends(get_db),
    admin=_super_admin,
):
    return await AdminService.create_tpo(db, data, admin.id)


@router.get("/tpos")
async def list_tpos(
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_or_admin,
):
    return await AdminService.get_tpos(db)


@router.put("/tpos/{tpo_id}")
async def update_tpo(
    tpo_id: uuid.UUID,
    data: UpdateTPORequest,
    db: AsyncSession = Depends(get_db),
    admin=_super_admin,
):
    return await AdminService.update_tpo(db, tpo_id, data, admin.id)


# ── Companies ─────────────────────────────────────────────────────────────────

@router.post("/companies", status_code=201)
async def create_company(
    data: CreateCompanyRequest,
    db: AsyncSession = Depends(get_db),
    admin=_super_admin,
):
    return await AdminService.create_company(db, data, admin.id)


@router.get("/companies")
async def list_companies(
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_or_admin,
):
    return await AdminService.get_companies(db)


@router.put("/companies/{company_id}")
async def update_company(
    company_id: uuid.UUID,
    data: UpdateCompanyRequest,
    db: AsyncSession = Depends(get_db),
    admin=_super_admin,
):
    return await AdminService.update_company(db, company_id, data, admin.id)


# ── Departments ───────────────────────────────────────────────────────────────

@router.post("/departments", status_code=201)
async def create_department(
    data: DepartmentCreate,
    db: AsyncSession = Depends(get_db),
    admin=_super_admin,
):
    return await AdminService.create_department(db, data, admin.id)


@router.get("/departments")
async def list_departments(
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_or_admin,
):
    return await AdminService.get_departments(db)


@router.put("/departments/{dept_id}")
async def update_department(
    dept_id: uuid.UUID,
    data: DepartmentUpdate,
    db: AsyncSession = Depends(get_db),
    admin=_super_admin,
):
    return await AdminService.update_department(db, dept_id, data, admin.id)


@router.delete("/departments/{dept_id}")
async def delete_department(
    dept_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin=_super_admin,
):
    return await AdminService.delete_department(db, dept_id, admin.id)


# ── Placement Cycles ──────────────────────────────────────────────────────────

@router.post("/cycles", status_code=201)
async def create_cycle(
    data: CreateCycleRequest,
    db: AsyncSession = Depends(get_db),
    admin=_super_admin,
):
    return await AdminService.create_cycle(db, data, admin.id)


@router.get("/cycles")
async def list_cycles(
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_or_admin,
):
    return await AdminService.get_cycles(db)


@router.post("/cycles/{cycle_id}/activate")
async def activate_cycle(
    cycle_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin=_super_admin,
):
    return await AdminService.activate_cycle(db, cycle_id, admin.id)


@router.post("/cycles/{cycle_id}/close")
async def close_cycle(
    cycle_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin=_super_admin,
):
    return await AdminService.close_cycle(db, cycle_id, admin.id)


@router.post("/cycles/{cycle_id}/enroll-department", status_code=201)
async def enroll_department(
    cycle_id: uuid.UUID,
    data: EnrollDepartmentRequest,
    db: AsyncSession = Depends(get_db),
    admin=_super_admin,
):
    return await AdminService.enroll_department(db, cycle_id, data, admin.id)


@router.get("/cycles/{cycle_id}/enrollments")
async def list_enrollments(
    cycle_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_or_admin,
):
    return await AdminService.get_enrollments(db, cycle_id)


# ── Users / Account management ────────────────────────────────────────────────

@router.post("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin=_super_admin,
):
    return await AdminService.deactivate_user(db, user_id, admin.id)


@router.post("/users/reset-password")
async def reset_password(
    data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
    admin=_super_admin,
):
    return await AdminService.reset_password(db, data, admin.id)


# ── Offers ────────────────────────────────────────────────────────────────────

@router.post("/offers/{offer_id}/override")
async def override_offer(
    offer_id: uuid.UUID,
    data: OfferOverrideRequest,
    db: AsyncSession = Depends(get_db),
    admin=_super_admin,
):
    return await AdminService.override_offer(db, offer_id, data, admin.id)


# ── System Config ─────────────────────────────────────────────────────────────

@router.get("/system-config")
async def get_system_config(
    db: AsyncSession = Depends(get_db),
    admin=_super_admin,
):
    return await AdminService.get_config(db)


@router.put("/system-config")
async def update_system_config(
    data: SystemConfigUpdate,
    db: AsyncSession = Depends(get_db),
    admin=_super_admin,
):
    return await AdminService.update_config(db, data, admin.id)


# ── Audit Logs ────────────────────────────────────────────────────────────────

@router.get("/audit-logs")
async def get_audit_logs(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    admin=_super_admin,
):
    return await AdminService.get_audit_logs(db, limit=limit, offset=offset)


# ── Analytics ─────────────────────────────────────────────────────────────────

@router.get("/analytics")
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    current_user=_tpo_or_admin,
):
    return await AdminService.get_analytics(db)


# ── Cache Management ──────────────────────────────────────────────────────────

@router.get("/cache/stats")
async def get_cache_statistics(
    admin=_super_admin,
):
    """Get cache hit/miss statistics and performance metrics."""
    stats = get_cache_stats()
    return {
        "status": "success",
        "data": stats,
        "message": "Cache is actively reducing database load"
    }


@router.post("/cache/clear")
async def clear_cache(
    admin=_super_admin,
):
    """Clear all cached data (use when updating static content)."""
    await clear_all_caches()
    return {
        "status": "success",
        "message": "All caches cleared successfully",
        "note": "New caches will be populated on next request"
    }


@router.post("/cache/reset-stats")
async def reset_stats(
    admin=_super_admin,
):
    """Reset cache statistics without clearing cached data."""
    reset_cache_stats()
    return {
        "status": "success",
        "message": "Cache statistics reset successfully"
    }
