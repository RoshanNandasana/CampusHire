import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin


class StudentSkill(UUIDMixin, Base):

    __tablename__ = "student_skills"

    student_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("students.id")
    )

    skill_name: Mapped[str] = mapped_column(String(100))