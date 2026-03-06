import uuid

from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin

class User(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True
    )

    password_hash: Mapped[str] = mapped_column(String(255))

    role_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("roles.id"), index=True
    )

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    role = relationship("Role", back_populates="users")

    student = relationship("Student", back_populates="user", uselist=False)
    company = relationship("Company", back_populates="user", uselist=False)
    tpo = relationship("TPOCoordinator", back_populates="user", uselist=False)