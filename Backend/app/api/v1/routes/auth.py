from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.auth_schema import LoginRequest, TokenResponse, ChangePasswordRequest
from app.core.db import get_db
from app.services.auth_service import login_user
from app.core.dependencies import get_current_user
from app.core.security import hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):

    tokens = await login_user(db, data.email, data.password)

    if not tokens:
        raise HTTPException(401, "Invalid credentials")

    return tokens


@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(data.old_password, user.password_hash):
        raise HTTPException(400, "Old password is incorrect")

    user.password_hash = hash_password(data.new_password)
    user.must_change_password = False

    await db.commit()

    return {"message": "Password updated"}


@router.post("/logout")
async def logout(user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):

    user.token_version += 1
    await db.commit()

    return {"message": "Logged out from all devices"}