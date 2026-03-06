import uuid

from sqlalchemy import ForeignKey, JSON, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin


class ResumeAIAnalysis(UUIDMixin, Base):

    __tablename__ = "resume_ai_analysis"

    resume_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("resumes.id")
    )

    ats_score: Mapped[int] = mapped_column(Integer)

    detected_skills: Mapped[dict] = mapped_column(JSON)

    skill_gaps: Mapped[dict] = mapped_column(JSON)