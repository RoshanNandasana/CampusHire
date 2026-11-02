import uuid

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin


class JobEligibility(UUIDMixin, Base):

    __tablename__ = "job_eligibilities"

    job_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("jobs.id"), index=True
    )

    department_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("departments.id")
    )

    min_cgpa: Mapped[float]

    max_backlogs: Mapped[int]