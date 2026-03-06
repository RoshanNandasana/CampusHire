import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin


class JobLocation(UUIDMixin, Base):

    __tablename__ = "job_locations"

    job_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("jobs.id")
    )

    location: Mapped[str] = mapped_column(String(255))