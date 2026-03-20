#!/usr/bin/env python
import asyncio
import importlib
import pkgutil
import uuid

import app.models as models_pkg
from sqlalchemy import select

from app.core.db import SessionLocal, engine
from app.core.security import hash_password
from app.models.base import Base
from app.models.company import Company
from app.models.departments import Department
from app.models.roles import Role
from app.models.students import Student
from app.models.tpo_coordinator import TPOCoordinator
from app.models.user import User


def _import_all_models() -> None:
    for _, module_name, _ in pkgutil.iter_modules(models_pkg.__path__):
        importlib.import_module(f"app.models.{module_name}")


async def _ensure_role(db, name: str) -> Role:
    row = await db.execute(select(Role).where(Role.name == name))
    role = row.scalar_one_or_none()
    if role:
        return role
    role = Role(name=name)
    db.add(role)
    await db.flush()
    return role


async def _ensure_department(db, name: str = "Computer Science") -> Department:
    row = await db.execute(select(Department).where(Department.name == name))
    dept = row.scalar_one_or_none()
    if dept:
        return dept
    dept = Department(name=name)
    db.add(dept)
    await db.flush()
    return dept


async def _upsert_user(db, *, email: str, password: str, role_id) -> User:
    row = await db.execute(select(User).where(User.email == email))
    user = row.scalar_one_or_none()
    if not user:
        user = User(
            email=email,
            password_hash=hash_password(password),
            role_id=role_id,
            is_active=True,
            must_change_password=False,
            token_version=1,
        )
        db.add(user)
        await db.flush()
        return user

    user.password_hash = hash_password(password)
    user.role_id = role_id
    user.is_active = True
    user.must_change_password = False
    await db.flush()
    return user


async def _ensure_student_profile(db, user: User, dept: Department) -> None:
    row = await db.execute(select(Student).where(Student.user_id == user.id))
    student = row.scalar_one_or_none()
    if student:
        student.department_id = dept.id
        student.cgpa = student.cgpa or 8.2
        student.tenth_percentage = student.tenth_percentage or 89.0
        student.twelfth_percentage = student.twelfth_percentage or 86.0
        student.backlog_count = student.backlog_count or 0
        if not student.enrollment_number:
            student.enrollment_number = "CS2026STU001"
        await db.flush()
        return

    db.add(
        Student(
            user_id=user.id,
            department_id=dept.id,
            enrollment_number="CS2026STU001",
            cgpa=8.2,
            tenth_percentage=89.0,
            twelfth_percentage=86.0,
            backlog_count=0,
            preferred_role="Software Engineer",
        )
    )
    await db.flush()


async def _ensure_company_profile(db, user: User) -> None:
    row = await db.execute(select(Company).where(Company.user_id == user.id))
    company = row.scalar_one_or_none()
    if company:
        if not company.name:
            company.name = "CampusHire Recruiters"
        await db.flush()
        return

    db.add(
        Company(
            user_id=user.id,
            name="CampusHire Recruiters",
            website="https://example.com",
            description="Recruitment partner for CampusHire demo.",
        )
    )
    await db.flush()


async def _ensure_tpo_profile(db, user: User, dept: Department) -> None:
    row = await db.execute(select(TPOCoordinator).where(TPOCoordinator.user_id == user.id))
    tpo = row.scalar_one_or_none()
    if tpo:
        tpo.department_id = dept.id
        if not tpo.name:
            tpo.name = "TPO Coordinator"
        await db.flush()
        return

    db.add(
        TPOCoordinator(
            user_id=user.id,
            department_id=dept.id,
            name="TPO Coordinator",
        )
    )
    await db.flush()


async def main() -> None:
    _import_all_models()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✓ Tables created")

    async with SessionLocal() as db:
        student_role = await _ensure_role(db, "STUDENT")
        company_role = await _ensure_role(db, "COMPANY")
        tpo_role = await _ensure_role(db, "TPO")
        await _ensure_role(db, "RECRUITER")
        await _ensure_role(db, "ADMIN")

        dept = await _ensure_department(db)

        student_user = await _upsert_user(
            db,
            email="student@example.com",
            password="student123",
            role_id=student_role.id,
        )
        recruiter_user = await _upsert_user(
            db,
            email="recruiter@example.com",
            password="recruiter123",
            role_id=company_role.id,
        )
        tpo_user = await _upsert_user(
            db,
            email="tpo@example.com",
            password="tpo123",
            role_id=tpo_role.id,
        )

        await _ensure_student_profile(db, student_user, dept)
        await _ensure_company_profile(db, recruiter_user)
        await _ensure_tpo_profile(db, tpo_user, dept)

        await db.commit()

    print("✓ Seed complete")
    print("✓ Student   : student@example.com / student123")
    print("✓ Recruiter : recruiter@example.com / recruiter123")
    print("✓ TPO       : tpo@example.com / tpo123")


if __name__ == "__main__":
    asyncio.run(main())
