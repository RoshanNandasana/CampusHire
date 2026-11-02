import uuid

from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin


class ResumeVersion(UUIDMixin, Base):

    __tablename__ = "resume_versions"

    resume_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("resumes.id")
    )

    version_number: Mapped[int] = mapped_column(Integer)

    file_url: Mapped[str] = mapped_column(Text)