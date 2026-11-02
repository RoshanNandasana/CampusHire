import uuid

from sqlalchemy import ForeignKey, String, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class StudentProject(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "student_projects"

    student_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("students.id"), index=True
    )

    title: Mapped[str] = mapped_column(String(255))

    role: Mapped[str] = mapped_column(String(255))

    organization: Mapped[str] = mapped_column(String(255))

    start_date: Mapped[str] = mapped_column(String(20))

    end_date: Mapped[str] = mapped_column(String(20), nullable=True)

    is_ongoing: Mapped[bool] = mapped_column(Boolean, default=False)

    technologies: Mapped[str] = mapped_column(Text)  # JSON array as string

    description: Mapped[str] = mapped_column(Text)

    impact: Mapped[str] = mapped_column(Text, nullable=True)

    project_url: Mapped[str] = mapped_column(String(500), nullable=True)

    repository_url: Mapped[str] = mapped_column(String(500), nullable=True)
