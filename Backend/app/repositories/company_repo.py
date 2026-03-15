from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.company import Company
from app.models.user import User


async def create_company(db: AsyncSession, user_id, name: str,
                          website: str | None = None,
                          description: str | None = None) -> Company:
    company = Company(
        user_id=user_id,
        name=name,
        website=website,
        description=description,
    )
    db.add(company)
    await db.commit()
    await db.refresh(company)
    return company


async def get_companies(db: AsyncSession) -> list[Company]:
    result = await db.execute(
        select(Company).options(selectinload(Company.user)).order_by(Company.name)
    )
    return result.scalars().all()


async def get_company_by_id(db: AsyncSession, company_id) -> Company | None:
    result = await db.execute(
        select(Company)
        .options(selectinload(Company.user))
        .where(Company.id == company_id)
    )
    return result.scalar_one_or_none()


async def get_company_by_user_id(db: AsyncSession, user_id) -> Company | None:
    result = await db.execute(
        select(Company).where(Company.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def update_company(db: AsyncSession, company_id, **kwargs) -> Company | None:
    company = await get_company_by_id(db, company_id)
    if not company:
        return None
    for key, value in kwargs.items():
        if value is not None:
            setattr(company, key, value)
    await db.commit()
    await db.refresh(company)
    return company


async def count_companies(db: AsyncSession) -> int:
    result = await db.execute(select(func.count()).select_from(Company))
    return result.scalar_one()
