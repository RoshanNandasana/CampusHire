"""
Global placement cycle managed by Super Admin.
A cycle represents an academic year's hiring cycle (e.g. "2025-26").
"""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class PlacementCycle(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "placement_cycles"

    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)

    status: Mapped[str] = mapped_column(
        String(50), default="DRAFT", index=True
    )  # DRAFT | ACTIVE | CLOSED

    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    enrollments = relationship(
        "DeptCycleEnrollment",
        back_populates="cycle",
        cascade="all, delete-orphan",
    )
