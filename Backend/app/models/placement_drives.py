import uuid
from datetime import datetime

from sqlalchemy import DateTime
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class PlacementDrive(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "placement_drives"

    company_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("companies.id")
    )

    name: Mapped[str] = mapped_column(String(255))

    drive_date: Mapped[datetime] = mapped_column(DateTime)

    registration_deadline: Mapped[datetime]

    status: Mapped[str] = mapped_column(String(50), index=True)