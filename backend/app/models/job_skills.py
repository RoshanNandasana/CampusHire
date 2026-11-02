import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin


class JobSkill(UUIDMixin, Base):

    __tablename__ = "job_skills"

    job_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("jobs.id")
    )

    skill_name: Mapped[str] = mapped_column(String(100), index=True)