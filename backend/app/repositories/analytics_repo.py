from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.company import Company
from app.models.departments import Department
from app.models.job_application import JobApplication
from app.models.offers import Offer
from app.models.students import Student


async def get_platform_analytics(db: AsyncSession) -> dict:
    # Total students
    total_students_r = await db.execute(select(func.count()).select_from(Student))
    total_students = total_students_r.scalar_one()

    # Total companies
    total_companies_r = await db.execute(select(func.count()).select_from(Company))
    total_companies = total_companies_r.scalar_one()

    # Total departments
    total_departments_r = await db.execute(select(func.count()).select_from(Department))
    total_departments = total_departments_r.scalar_one()

    # Total placed = offers with status ACCEPTED
    total_placed_r = await db.execute(
        select(func.count())
        .select_from(Offer)
        .where(Offer.status == "ACCEPTED")
    )
    total_placed = total_placed_r.scalar_one()

    # Average CTC of accepted offers
    avg_ctc_r = await db.execute(
        select(func.avg(Offer.salary))
        .where(Offer.status == "ACCEPTED")
    )
    avg_ctc = float(avg_ctc_r.scalar_one() or 0)

    return {
        "total_placed": total_placed,
        "total_companies": total_companies,
        "avg_ctc": avg_ctc,
        "total_students": total_students,
        "total_departments": total_departments,
    }
