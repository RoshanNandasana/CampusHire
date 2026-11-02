import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin


class InterviewRound(UUIDMixin, Base):

    __tablename__ = "interview_rounds"

    job_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("jobs.id")
    )

    name: Mapped[str] = mapped_column(String(100))

    round_order: Mapped[int]