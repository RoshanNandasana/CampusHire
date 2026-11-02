"""
Async service layer for all Super Admin operations.
"""
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.repositories import (
    user_repo,
    department_repo,
    company_repo,
    tpo_repo,
    cycle_repo,
    audit_repo,
    offer_repo,
    analytics_repo,
    config_repo,
)


class AdminService:

    # ── Users / Deactivation ─────────────────────────────────────────────────

    @staticmethod
    async def deactivate_user(db: AsyncSession, user_id, admin_user_id):
        user = await user_repo.set_active(db, user_id, False)
        if not user:
            raise HTTPException(404, "User not found")
        await audit_repo.create_log(
            db, admin_user_id, "DEACTIVATE_USER", "user", str(user_id),
            {"email": user.email},
        )
        return {"message": f"User {user.email} deactivated"}

    @staticmethod
    async def reset_password(db: AsyncSession, data, admin_user_id):
        new_hash = hash_password(data.password)
        user = await user_repo.reset_password(db, data.user_id, new_hash)
        if not user:
            raise HTTPException(404, "User not found")
        await audit_repo.create_log(
            db, admin_user_id, "RESET_PASSWORD", "user", str(data.user_id), {}
        )
        return {"message": "Password reset successfully"}

    # ── TPO Coordinators ─────────────────────────────────────────────────────

    @staticmethod
    async def create_tpo(db: AsyncSession, data, admin_user_id):
        existing = await user_repo.get_user_by_email(db, data.email)
        if existing:
            raise HTTPException(400, "Email already registered")

        password_hash = hash_password(data.password)
        user = await user_repo.create_user(db, data.email, password_hash, "TPO")
        tpo = await tpo_repo.create_tpo_coordinator(
            db, user.id, data.department_id, data.name
        )

        await audit_repo.create_log(
            db, admin_user_id, "CREATE_TPO", "tpo_coordinator", str(tpo.id),
            {"email": data.email, "department_id": str(data.department_id)},
        )
        return {
            "id": str(tpo.id),
            "user_id": str(user.id),
            "email": user.email,
            "name": tpo.name,
            "department_id": str(tpo.department_id),
            "is_active": user.is_active,
            "created_at": tpo.created_at,
        }

    @staticmethod
    async def get_tpos(db: AsyncSession):
        tpos = await tpo_repo.get_tpos(db)
        return [
            {
                "id": str(t.id),
                "user_id": str(t.user_id),
                "email": t.user.email if t.user else None,
                "name": t.name,
                "department_id": str(t.department_id),
                "is_active": t.user.is_active if t.user else None,
                "created_at": t.created_at,
            }
            for t in tpos
        ]

    @staticmethod
    async def update_tpo(db: AsyncSession, tpo_id, data, admin_user_id):
        tpo = await tpo_repo.get_tpo_by_id(db, tpo_id)
        if not tpo:
            raise HTTPException(404, "TPO not found")

        update_kwargs = {}
        if data.name is not None:
            update_kwargs["name"] = data.name
        if data.department_id is not None:
            update_kwargs["department_id"] = data.department_id

        if update_kwargs:
            tpo = await tpo_repo.update_tpo(db, tpo_id, **update_kwargs)

        if data.email is not None:
            await user_repo.update_user_email(db, tpo.user_id, data.email)

        if data.password is not None:
            new_hash = hash_password(data.password)
            await user_repo.reset_password(db, tpo.user_id, new_hash)

        await audit_repo.create_log(
            db, admin_user_id, "UPDATE_TPO", "tpo_coordinator", str(tpo_id), {}
        )
        return {"message": "TPO updated"}

    # ── Companies ────────────────────────────────────────────────────────────

    @staticmethod
    async def create_company(db: AsyncSession, data, admin_user_id):
        existing = await user_repo.get_user_by_email(db, data.email)
        if existing:
            raise HTTPException(400, "Email already registered")

        password_hash = hash_password(data.password)
        user = await user_repo.create_user(db, data.email, password_hash, "COMPANY")
        company = await company_repo.create_company(
            db, user.id, data.name, data.website, data.description
        )

        await audit_repo.create_log(
            db, admin_user_id, "CREATE_COMPANY", "company", str(company.id),
            {"email": data.email, "name": data.name},
        )
        return {
            "id": str(company.id),
            "user_id": str(user.id),
            "email": user.email,
            "name": company.name,
            "website": company.website,
            "description": company.description,
            "is_active": user.is_active,
            "created_at": company.created_at,
        }

    @staticmethod
    async def get_companies(db: AsyncSession):
        companies = await company_repo.get_companies(db)
        return [
            {
                "id": str(c.id),
                "user_id": str(c.user_id),
                "email": c.user.email if c.user else None,
                "name": c.name,
                "website": c.website,
                "description": c.description,
                "is_active": c.user.is_active if c.user else None,
                "created_at": c.created_at,
            }
            for c in companies
        ]

    @staticmethod
    async def update_company(db: AsyncSession, company_id, data, admin_user_id):
        company = await company_repo.get_company_by_id(db, company_id)
        if not company:
            raise HTTPException(404, "Company not found")

        update_kwargs = {}
        if data.name is not None:
            update_kwargs["name"] = data.name
        if data.website is not None:
            update_kwargs["website"] = data.website
        if data.description is not None:
            update_kwargs["description"] = data.description

        if update_kwargs:
            await company_repo.update_company(db, company_id, **update_kwargs)

        if data.email is not None:
            await user_repo.update_user_email(db, company.user_id, data.email)

        if data.password is not None:
            new_hash = hash_password(data.password)
            await user_repo.reset_password(db, company.user_id, new_hash)

        await audit_repo.create_log(
            db, admin_user_id, "UPDATE_COMPANY", "company", str(company_id), {}
        )
        return {"message": "Company updated"}

    # ── Departments ──────────────────────────────────────────────────────────

    @staticmethod
    async def create_department(db: AsyncSession, data, admin_user_id):
        dept = await department_repo.create_department(db, data)
        await audit_repo.create_log(
            db, admin_user_id, "CREATE_DEPARTMENT", "department", str(dept.id),
            {"name": dept.name},
        )
        return dept

    @staticmethod
    async def get_departments(db: AsyncSession):
        return await department_repo.get_departments(db)

    @staticmethod
    async def update_department(db: AsyncSession, dept_id, data, admin_user_id):
        dept = await department_repo.update_department(db, dept_id, data)
        if not dept:
            raise HTTPException(404, "Department not found")
        await audit_repo.create_log(
            db, admin_user_id, "UPDATE_DEPARTMENT", "department", str(dept_id), {}
        )
        return dept

    @staticmethod
    async def delete_department(db: AsyncSession, dept_id, admin_user_id):
        deleted = await department_repo.delete_department(db, dept_id)
        if not deleted:
            raise HTTPException(404, "Department not found")
        await audit_repo.create_log(
            db, admin_user_id, "DELETE_DEPARTMENT", "department", str(dept_id), {}
        )
        return {"message": "Department deleted"}

    # ── Placement Cycles ─────────────────────────────────────────────────────

    @staticmethod
    async def create_cycle(db: AsyncSession, data, admin_user_id):
        cycle = await cycle_repo.create_cycle(db, data)
        await audit_repo.create_log(
            db, admin_user_id, "CREATE_CYCLE", "placement_cycle", str(cycle.id),
            {"name": cycle.name},
        )
        return cycle

    @staticmethod
    async def get_cycles(db: AsyncSession):
        return await cycle_repo.get_cycles(db)

    @staticmethod
    async def activate_cycle(db: AsyncSession, cycle_id, admin_user_id):
        cycle = await cycle_repo.activate_cycle(db, cycle_id)
        if not cycle:
            raise HTTPException(404, "Cycle not found")
        await audit_repo.create_log(
            db, admin_user_id, "ACTIVATE_CYCLE", "placement_cycle", str(cycle_id), {}
        )
        return cycle

    @staticmethod
    async def close_cycle(db: AsyncSession, cycle_id, admin_user_id):
        cycle = await cycle_repo.close_cycle(db, cycle_id)
        if not cycle:
            raise HTTPException(404, "Cycle not found")
        await audit_repo.create_log(
            db, admin_user_id, "CLOSE_CYCLE", "placement_cycle", str(cycle_id), {}
        )
        return cycle

    @staticmethod
    async def enroll_department(db: AsyncSession, cycle_id, data, admin_user_id):
        # Check no duplicate
        existing = await cycle_repo.get_enrollment(db, cycle_id, data.department_id)
        if existing:
            raise HTTPException(400, "Department already enrolled in this cycle")

        enrollment = await cycle_repo.enroll_department(
            db, cycle_id, data.department_id,
            data.application_open, data.application_close,
        )
        await audit_repo.create_log(
            db, admin_user_id, "ENROLL_DEPARTMENT", "dept_cycle_enrollment",
            str(enrollment.id),
            {"cycle_id": str(cycle_id), "department_id": str(data.department_id)},
        )
        return enrollment

    @staticmethod
    async def get_enrollments(db: AsyncSession, cycle_id):
        enrollments = await cycle_repo.get_enrollments(db, cycle_id)
        if enrollments is None:
            raise HTTPException(404, "Cycle not found")
        return enrollments

    # ── Offer Override ───────────────────────────────────────────────────────

    @staticmethod
    async def override_offer(db: AsyncSession, offer_id, data, admin_user_id):
        offer = await offer_repo.override_offer_status(
            db, offer_id, data.new_status, data.reason, admin_user_id
        )
        if not offer:
            raise HTTPException(404, "Offer not found")
        await audit_repo.create_log(
            db, admin_user_id, "OVERRIDE_OFFER", "offer", str(offer_id),
            {"new_status": data.new_status, "reason": data.reason},
        )
        return offer

    # ── System Config ────────────────────────────────────────────────────────

    @staticmethod
    async def get_config(db: AsyncSession):
        config = await config_repo.get_config(db)
        if not config:
            raise HTTPException(404, "System config not initialised")
        return config

    @staticmethod
    async def update_config(db: AsyncSession, data, admin_user_id):
        config = await config_repo.upsert_config(db, data)
        await audit_repo.create_log(
            db, admin_user_id, "UPDATE_SYSTEM_CONFIG", "system_config",
            str(config.id), {},
        )
        return config

    # ── Audit Logs ───────────────────────────────────────────────────────────

    @staticmethod
    async def get_audit_logs(db: AsyncSession, limit: int = 100, offset: int = 0):
        return await audit_repo.get_logs(db, limit=limit, offset=offset)

    # ── Analytics ────────────────────────────────────────────────────────────

    @staticmethod
    async def get_analytics(db: AsyncSession):
        return await analytics_repo.get_platform_analytics(db)
