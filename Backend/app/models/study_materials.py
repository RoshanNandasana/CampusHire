import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class StudyMaterial(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "study_materials"

    title: Mapped[str] = mapped_column(String(255))

    category: Mapped[str] = mapped_column(String(100), index=True)

    file_url: Mapped[str] = mapped_column(Text)

    created_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id")
    )