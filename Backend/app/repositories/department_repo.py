from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.departments import Department


async def create_department(db: AsyncSession, data) -> Department:
    dept = Department(name=data.name)
    db.add(dept)
    await db.commit()
    await db.refresh(dept)
    return dept


async def get_departments(db: AsyncSession) -> list[Department]:
    result = await db.execute(select(Department).order_by(Department.name))
    return result.scalars().all()


async def get_department_by_id(db: AsyncSession, dept_id) -> Department | None:
    result = await db.execute(select(Department).where(Department.id == dept_id))
    return result.scalar_one_or_none()


async def update_department(db: AsyncSession, dept_id, data) -> Department | None:
    dept = await get_department_by_id(db, dept_id)
    if not dept:
        return None
    if data.name is not None:
        dept.name = data.name
    await db.commit()
    await db.refresh(dept)
    return dept


async def delete_department(db: AsyncSession, dept_id) -> bool:
    dept = await get_department_by_id(db, dept_id)
    if not dept:
        return False
    await db.delete(dept)
    await db.commit()
    return True
