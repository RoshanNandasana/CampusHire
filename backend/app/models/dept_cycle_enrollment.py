"""
Enrollment of a department into a placement cycle with its own
application-window dates.
"""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class DeptCycleEnrollment(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "dept_cycle_enrollments"

    __table_args__ = (
        UniqueConstraint("cycle_id", "department_id"),
    )

    cycle_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("placement_cycles.id"), index=True
    )

    department_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("departments.id"), index=True
    )

    application_open: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    application_close: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    cycle = relationship("PlacementCycle", back_populates="enrollments")
