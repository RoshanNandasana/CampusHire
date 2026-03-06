from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin

class Role(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(50), unique=True, index=True)

    users = relationship("User", back_populates="role")