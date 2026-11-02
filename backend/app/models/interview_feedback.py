import uuid

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class InterviewFeedback(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "interview_feedback"

    application_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("job_applications.id"),
        index=True,
    )
    interview_round_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("interview_rounds.id"),
        index=True,
    )
    interviewer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
    )
    score: Mapped[int | None] = mapped_column(Integer)
    decision: Mapped[str] = mapped_column(String(50), index=True)
    remarks: Mapped[str | None] = mapped_column(Text)

    application = relationship("JobApplication", back_populates="interview_feedback")
    interview_round = relationship("InterviewRound")
    interviewer = relationship("User")
