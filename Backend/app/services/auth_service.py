from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from datetime import datetime

from app.repositories.user_repo import get_user_by_email
from app.core.security import verify_password
from app.core.paseto import create_access_token, create_refresh_token
from app.models.students import Student
from app.models.tpo_coordinator import TPOCoordinator
from app.models.company import Company
from app.models.company_recruiter import CompanyRecruiter


async def login_user(db: AsyncSession, email: str, password: str):

    user = await get_user_by_email(db, email)

    if not user:
        return None

    if not user.is_active:
        return None

    if not verify_password(password, user.password_hash):
        return None

    payload = {
        "user_id": str(user.id),
        "role": user.role.name if user.role else None,
        "department_id": None,
        "token_version": user.token_version,
    }

    access_token = create_access_token(payload)
    refresh_token = create_refresh_token(payload)

    user.last_login_at = datetime.utcnow()

    await db.commit()

    role_name = user.role.name if user.role else ""
    frontend_role = "recruiter" if role_name.upper() == "COMPANY" else role_name.lower()
    student_id = None
    department_id = None
    company_id = None
    company_name = None

    if role_name == "STUDENT":
        student_row = await db.execute(select(Student).where(Student.user_id == user.id))
        student = student_row.scalar_one_or_none()
        if student:
            student_id = str(student.id)
            department_id = str(student.department_id)

    if role_name == "TPO":
        tpo_row = await db.execute(select(TPOCoordinator).where(TPOCoordinator.user_id == user.id))
        tpo = tpo_row.scalar_one_or_none()
        if tpo:
            department_id = str(tpo.department_id)

    if role_name == "COMPANY":
        company_row = await db.execute(select(Company).where(Company.user_id == user.id))
        company = company_row.scalar_one_or_none()
        if company:
            company_id = str(company.id)
            company_name = company.name

    if role_name == "RECRUITER":
        recruiter_company_row = await db.execute(
            select(Company)
            .join(CompanyRecruiter, CompanyRecruiter.company_id == Company.id)
            .where(func.lower(CompanyRecruiter.email) == user.email.lower())
            .limit(1)
        )
        recruiter_company = recruiter_company_row.scalar_one_or_none()
        if recruiter_company:
            company_id = str(recruiter_company.id)
            company_name = recruiter_company.name

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user_id": str(user.id),
        "email": user.email,
        "role": frontend_role,
        "student_id": student_id,
        "department_id": department_id,
        "company_id": company_id,
        "company_name": company_name,
    }