import uuid
from typing import Optional

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class OfferHistory(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "offer_history"

    offer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("offers.id"), index=True
    )

    # user who made the change (admin or system)
    changed_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("users.id"), nullable=True
    )

    old_status: Mapped[str] = mapped_column(String(50))

    new_status: Mapped[str] = mapped_column(String(50), index=True)

    # mandatory reason when an admin overrides
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)