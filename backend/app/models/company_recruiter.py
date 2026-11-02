import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class CompanyRecruiter(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "company_recruiters"

    company_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("companies.id")
    )

    name: Mapped[str] = mapped_column(String(255))

    email: Mapped[str] = mapped_column(String(255), index=True)

    phone: Mapped[str | None] = mapped_column(String(20))