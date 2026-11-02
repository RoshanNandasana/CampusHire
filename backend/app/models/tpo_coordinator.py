import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class TPOCoordinator(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "tpo_coordinators"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), unique=True
    )

    department_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("departments.id"), index=True
    )

    name: Mapped[str] = mapped_column(String(255))

    user = relationship("User", back_populates="tpo")

    department = relationship("Department", back_populates="tpo_coordinators")