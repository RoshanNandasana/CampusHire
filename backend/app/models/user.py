import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class User(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    role_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("roles.id"),
        index=True,
        nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )

    # required by PRD
    must_change_password: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )

    # used for invalidating sessions
    token_version: Mapped[int] = mapped_column(
        default=1
    )

    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    role = relationship(
        "Role",
        back_populates="users"
    )

    student = relationship(
        "Student",
        back_populates="user",
        uselist=False
    )

    company = relationship(
        "Company",
        back_populates="user",
        uselist=False
    )

    tpo = relationship(
        "TPOCoordinator",
        back_populates="user",
        uselist=False
    )