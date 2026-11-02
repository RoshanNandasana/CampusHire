"""
Singleton system configuration managed by Super Admin.
Row with id=1 is always the live config.
"""
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class SystemConfig(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "system_configs"

    ai_model: Mapped[str] = mapped_column(String(100), default="gpt-4o")

    prompt_version: Mapped[str] = mapped_column(String(50), default="v1")

    login_rate_limit: Mapped[int] = mapped_column(Integer, default=5)

    login_rate_window: Mapped[int] = mapped_column(Integer, default=900)
