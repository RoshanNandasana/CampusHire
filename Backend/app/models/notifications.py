import uuid

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class Notification(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "notifications"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id")
    )

    title: Mapped[str] = mapped_column(String(255))

    message: Mapped[str] = mapped_column(Text)

    is_read: Mapped[bool] = mapped_column(Boolean, default=False)