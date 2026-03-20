import uuid

from sqlalchemy import ForeignKey, String, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class StudentCertification(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "student_certifications"

    student_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("students.id"), index=True
    )

    name: Mapped[str] = mapped_column(String(255))

    issuer: Mapped[str] = mapped_column(String(255))

    issue_date: Mapped[str] = mapped_column(String(20))

    expiry_date: Mapped[str] = mapped_column(String(20), nullable=True)

    no_expiry: Mapped[bool] = mapped_column(Boolean, default=False)

    credential_id: Mapped[str] = mapped_column(String(255), nullable=True)

    credential_url: Mapped[str] = mapped_column(String(500), nullable=True)

    skills_covered: Mapped[str] = mapped_column(Text, default="[]")  # JSON array as string
