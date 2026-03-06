import uuid

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin


class MaterialAccess(UUIDMixin, Base):

    __tablename__ = "material_access"

    material_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("study_materials.id")
    )

    student_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("students.id")
    )