from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.repositories.user_repo import get_user_by_email
from app.core.security import verify_password
from app.core.paseto import create_access_token, create_refresh_token


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

    return access_token, refresh_token