from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.tpo_coordinator import TPOCoordinator
from app.models.user import User


async def create_tpo_coordinator(db: AsyncSession, user_id, department_id, name: str) -> TPOCoordinator:
    tpo = TPOCoordinator(user_id=user_id, department_id=department_id, name=name)
    db.add(tpo)
    await db.commit()
    await db.refresh(tpo)
    return tpo


async def get_tpos(db: AsyncSession) -> list[TPOCoordinator]:
    result = await db.execute(
        select(TPOCoordinator)
        .options(selectinload(TPOCoordinator.user), selectinload(TPOCoordinator.department))
        .order_by(TPOCoordinator.name)
    )
    return result.scalars().all()


async def get_tpo_by_user_id(db: AsyncSession, user_id) -> TPOCoordinator | None:
    result = await db.execute(
        select(TPOCoordinator).where(TPOCoordinator.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def get_tpo_by_id(db: AsyncSession, tpo_id) -> TPOCoordinator | None:
    result = await db.execute(
        select(TPOCoordinator)
        .options(selectinload(TPOCoordinator.user), selectinload(TPOCoordinator.department))
        .where(TPOCoordinator.id == tpo_id)
    )
    return result.scalar_one_or_none()


async def update_tpo(db: AsyncSession, tpo_id, **kwargs) -> TPOCoordinator | None:
    tpo = await get_tpo_by_id(db, tpo_id)
    if not tpo:
        return None
    for key, value in kwargs.items():
        if value is not None:
            setattr(tpo, key, value)
    await db.commit()
    await db.refresh(tpo)
    return tpo
