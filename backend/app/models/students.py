import uuid

from sqlalchemy import Float, Integer, Text
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin

class Student(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "students"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), unique=True
    )

    department_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("departments.id"), index=True
    )

    enrollment_number: Mapped[str] = mapped_column(
        String(50), unique=True, index=True
    )

    cgpa: Mapped[float] = mapped_column(Float)

    tenth_percentage: Mapped[float] = mapped_column(Float)

    twelfth_percentage: Mapped[float] = mapped_column(Float)

    backlog_count: Mapped[int] = mapped_column(Integer)

    # Additional profile fields
    phone: Mapped[str] = mapped_column(String(20), nullable=True)

    date_of_birth: Mapped[str] = mapped_column(String(20), nullable=True)

    university_id: Mapped[str] = mapped_column(String(100), nullable=True)

    preferred_role: Mapped[str] = mapped_column(String(255), nullable=True)

    profile_image: Mapped[str] = mapped_column(Text, nullable=True)  # Base64 encoded image

    linkedin_url: Mapped[str] = mapped_column(String(500), nullable=True)

    github_url: Mapped[str] = mapped_column(String(500), nullable=True)

    portfolio_url: Mapped[str] = mapped_column(String(500), nullable=True)

    user = relationship("User", back_populates="student")

    department = relationship("Department", back_populates="students")

    applications = relationship("JobApplication", back_populates="student")

    blacklists = relationship(
        "Blacklist",
        back_populates="student",
        cascade="all, delete-orphan",
    )