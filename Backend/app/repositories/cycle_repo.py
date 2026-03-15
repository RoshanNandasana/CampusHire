from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.placement_cycle import PlacementCycle
from app.models.dept_cycle_enrollment import DeptCycleEnrollment


async def create_cycle(db: AsyncSession, data) -> PlacementCycle:
    cycle = PlacementCycle(
        name=data.name,
        start_date=data.start_date,
        end_date=data.end_date,
        status="DRAFT",
    )
    db.add(cycle)
    await db.commit()
    await db.refresh(cycle)
    return cycle


async def get_cycles(db: AsyncSession) -> list[PlacementCycle]:
    result = await db.execute(
        select(PlacementCycle).order_by(PlacementCycle.created_at.desc())
    )
    return result.scalars().all()


async def get_cycle_by_id(db: AsyncSession, cycle_id) -> PlacementCycle | None:
    result = await db.execute(
        select(PlacementCycle).where(PlacementCycle.id == cycle_id)
    )
    return result.scalar_one_or_none()


async def activate_cycle(db: AsyncSession, cycle_id) -> PlacementCycle | None:
    cycle = await get_cycle_by_id(db, cycle_id)
    if not cycle:
        return None
    cycle.status = "ACTIVE"
    await db.commit()
    await db.refresh(cycle)
    return cycle


async def close_cycle(db: AsyncSession, cycle_id) -> PlacementCycle | None:
    cycle = await get_cycle_by_id(db, cycle_id)
    if not cycle:
        return None
    cycle.status = "CLOSED"
    await db.commit()
    await db.refresh(cycle)
    return cycle


async def enroll_department(db: AsyncSession, cycle_id, department_id,
                             application_open, application_close) -> DeptCycleEnrollment:
    enrollment = DeptCycleEnrollment(
        cycle_id=cycle_id,
        department_id=department_id,
        application_open=application_open,
        application_close=application_close,
    )
    db.add(enrollment)
    await db.commit()
    await db.refresh(enrollment)
    return enrollment


async def get_enrollments(db: AsyncSession, cycle_id) -> list[DeptCycleEnrollment]:
    result = await db.execute(
        select(DeptCycleEnrollment).where(DeptCycleEnrollment.cycle_id == cycle_id)
    )
    return result.scalars().all()


async def get_enrollment(db: AsyncSession, cycle_id, department_id) -> DeptCycleEnrollment | None:
    result = await db.execute(
        select(DeptCycleEnrollment).where(
            DeptCycleEnrollment.cycle_id == cycle_id,
            DeptCycleEnrollment.department_id == department_id,
        )
    )
    return result.scalar_one_or_none()
