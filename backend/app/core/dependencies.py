from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.paseto import decode_token
from app.repositories.user_repo import get_user_by_id

security = HTTPBearer()


async def get_current_user(token=Depends(security), db: AsyncSession = Depends(get_db)):
    try:
        payload = decode_token(token.credentials)
    except Exception as exc:
        raise HTTPException(401, "Invalid or expired token") from exc

    if payload.get("type") != "access":
        raise HTTPException(401, "Invalid token type")

    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(401, "Invalid token payload")

    user = await get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(401, "User not found")

    if user.token_version != payload.get("token_version"):
        raise HTTPException(401, "Session expired")

    return user