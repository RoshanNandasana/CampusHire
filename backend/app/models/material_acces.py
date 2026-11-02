import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class MaterialAccess(UUIDMixin, TimestampMixin, Base):

    __tablename__ = "material_access"

    material_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("study_materials.id")
    )

    student_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("students.id")
    )

    access_type: Mapped[str] = mapped_column(String(20), index=True, default="VIEW")