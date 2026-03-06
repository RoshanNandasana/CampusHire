import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class Company(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "companies"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), unique=True
    )

    name: Mapped[str] = mapped_column(String(255), index=True)

    website: Mapped[str | None] = mapped_column(String(255))

    description: Mapped[str | None] = mapped_column(Text)

    user = relationship("User", back_populates="company")

    jobs = relationship("Job", back_populates="company")

    blacklists = relationship(
        "Blacklist",
        back_populates="company",
        cascade="all, delete-orphan",
    )

    documents = relationship(
        "CompanyDocument",
        back_populates="company",
        cascade="all, delete-orphan",
    )