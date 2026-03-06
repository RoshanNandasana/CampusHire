import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class Job(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "jobs"

    company_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("companies.id"), index=True
    )

    drive_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("placement_drives.id")
    )

    title: Mapped[str] = mapped_column(String(255), index=True)

    description: Mapped[str]

    salary: Mapped[int]

    application_deadline: Mapped[datetime]

    company = relationship("Company", back_populates="jobs")