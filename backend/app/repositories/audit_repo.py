from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.auditlog import AuditLog


async def create_log(db: AsyncSession, user_id, action: str,
                     entity_type: str, entity_id: str,
                     metadata: dict | None = None) -> AuditLog:
    log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id),
        metadata_json=metadata or {},
    )
    db.add(log)
    await db.commit()
    return log


async def get_logs(db: AsyncSession, limit: int = 500, offset: int = 0) -> list[AuditLog]:
    result = await db.execute(
        select(AuditLog)
        .order_by(AuditLog.id.desc())
        .limit(limit)
        .offset(offset)
    )
    return result.scalars().all()
