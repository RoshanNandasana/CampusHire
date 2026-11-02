import uuid

from sqlalchemy import ForeignKey, String, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin, TimestampMixin


class StudentSkill(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "student_skills"

    student_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("students.id"), index=True
    )

    skill_name: Mapped[str] = mapped_column(String(100))

    proficiency: Mapped[str] = mapped_column(String(50), default="intermediate")  # beginner, intermediate, advanced, expert

    years_of_experience: Mapped[float] = mapped_column(default=0.0)

    endorsement_count: Mapped[int] = mapped_column(default=0)