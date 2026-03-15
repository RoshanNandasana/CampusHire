from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.user import User
from app.models.roles import Role


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(
        select(User).options(selectinload(User.role)).where(User.email == email)
    )
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id) -> User | None:
    result = await db.execute(
        select(User).options(selectinload(User.role)).where(User.id == user_id)
    )
    return result.scalar_one_or_none()


async def get_role_by_name(db: AsyncSession, role_name: str) -> Role | None:
    result = await db.execute(select(Role).where(Role.name == role_name))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, email: str, password_hash: str,
                      role_name: str) -> User:
    role = await get_role_by_name(db, role_name)
    if not role:
        raise ValueError(f"Role '{role_name}' not found")
    user = User(email=email, password_hash=password_hash, role_id=role.id)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def get_all_users(db: AsyncSession) -> list[User]:
    result = await db.execute(
        select(User).options(selectinload(User.role)).order_by(User.created_at.desc())
    )
    return result.scalars().all()


async def update_user_email(db: AsyncSession, user_id, email: str) -> User | None:
    user = await get_user_by_id(db, user_id)
    if not user:
        return None
    user.email = email
    await db.commit()
    await db.refresh(user)
    return user


async def reset_password(db: AsyncSession, user_id, new_hash: str) -> User | None:
    user = await get_user_by_id(db, user_id)
    if not user:
        return None
    user.password_hash = new_hash
    user.must_change_password = True
    await db.commit()
    return user


async def set_active(db: AsyncSession, user_id, is_active: bool) -> User | None:
    user = await get_user_by_id(db, user_id)
    if not user:
        return None
    user.is_active = is_active
    await db.commit()
    return user