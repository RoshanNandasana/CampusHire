import uuid

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class Offer(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "offers"

    application_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("job_applications.id")
    )

    salary: Mapped[int] = mapped_column(Integer)

    status: Mapped[str] = mapped_column(String(50), index=True)

    offer_letter_url: Mapped[str] = mapped_column(Text)