import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class JobApplication(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "job_applications"

    student_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("students.id"), index=True
    )

    job_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("jobs.id"), index=True
    )

    status: Mapped[str] = mapped_column(String(50), index=True)

    student = relationship("Student", back_populates="applications")

    interview_feedback = relationship(
        "InterviewFeedback",
        back_populates="application",
        cascade="all, delete-orphan",
    )