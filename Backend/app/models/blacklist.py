import uuid
from datetime import datetime

from sqlalchemy import String, ForeignKey, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base, UUIDMixin, TimestampMixin


class Blacklist(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "blacklists"

    student_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("students.id"),
        index=True,
        nullable=True
    )

    company_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("companies.id"),
        index=True,
        nullable=True
    )

    reason: Mapped[str] = mapped_column(Text)

    blacklisted_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        index=True
    )

    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    student = relationship("Student", back_populates="blacklists")

    company = relationship("Company", back_populates="blacklists")

    issued_by = relationship("User")