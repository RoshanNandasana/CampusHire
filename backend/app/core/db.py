import os
from pathlib import Path
from typing import AsyncGenerator

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine


BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")


DATABASE_URL = os.getenv(
	"DATABASE_URL",
	"postgresql+asyncpg://campushire:campushire@localhost:5432/campushire_db",
)

engine = create_async_engine(DATABASE_URL, future=True, echo=False)
SessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
	async with SessionLocal() as session:
		yield session
