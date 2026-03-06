import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class StudentDocument(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "student_documents"

    student_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("students.id")
    )

    document_type: Mapped[str] = mapped_column(String(50), index=True)

    file_url: Mapped[str] = mapped_column(Text)