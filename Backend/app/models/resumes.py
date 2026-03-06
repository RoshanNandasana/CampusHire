import uuid

from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class Resume(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "resumes"

    student_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("students.id"), index=True
    )

    file_url: Mapped[str] = mapped_column(Text)