from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.system_config import SystemConfig


async def get_config(db: AsyncSession) -> SystemConfig | None:
    result = await db.execute(select(SystemConfig).limit(1))
    return result.scalar_one_or_none()


async def upsert_config(db: AsyncSession, data) -> SystemConfig:
    config = await get_config(db)
    if not config:
        config = SystemConfig()
        db.add(config)

    if data.ai_model is not None:
        config.ai_model = data.ai_model
    if data.prompt_version is not None:
        config.prompt_version = data.prompt_version
    if data.login_rate_limit is not None:
        config.login_rate_limit = data.login_rate_limit
    if data.login_rate_window is not None:
        config.login_rate_window = data.login_rate_window

    await db.commit()
    await db.refresh(config)
    return config
