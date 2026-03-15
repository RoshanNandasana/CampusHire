import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin


class ApplicationEligibilitySnapshot(UUIDMixin, Base):

    __tablename__ = "application_eligibility_snapshots"

    __table_args__ = (
        UniqueConstraint("application_id"),
    )

    application_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("job_applications.id"),
        index=True,
    )

    student_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("students.id"),
        index=True,
    )

    job_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("jobs.id"),
        index=True,
    )

    department_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("departments.id"),
        index=True,
    )

    min_cgpa: Mapped[float | None] = mapped_column(Float, nullable=True)

    max_backlogs: Mapped[int | None] = mapped_column(Integer, nullable=True)

    student_cgpa: Mapped[float] = mapped_column(Float)

    student_backlogs: Mapped[int] = mapped_column(Integer)

    is_eligible: Mapped[bool] = mapped_column(Boolean)

    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
