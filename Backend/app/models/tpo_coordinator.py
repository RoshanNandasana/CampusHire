import uuid

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class TPOCoordinator(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "tpo_coordinators"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), unique=True
    )

    department_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("departments.id")
    )

    user = relationship("User", back_populates="tpo")