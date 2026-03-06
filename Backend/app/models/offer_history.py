import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin


class OfferHistory(UUIDMixin, Base):

    __tablename__ = "offer_history"

    offer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("offers.id")
    )

    status: Mapped[str] = mapped_column(String(50), index=True)