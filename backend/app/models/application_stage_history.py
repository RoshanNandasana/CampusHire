import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin


class ApplicationStageHistory(UUIDMixin, Base):

    __tablename__ = "application_stage_history"

    application_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("job_applications.id")
    )

    interview_round_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("interview_rounds.id")
    )

    status: Mapped[str] = mapped_column(String(50))

    remarks: Mapped[str | None] = mapped_column(Text)