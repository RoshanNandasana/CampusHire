from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class Department(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "departments"

    name: Mapped[str] = mapped_column(String(100), unique=True)

    students = relationship("Student", back_populates="department")