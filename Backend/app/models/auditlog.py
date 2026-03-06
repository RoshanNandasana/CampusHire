import uuid

from sqlalchemy import JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin


class AuditLog(UUIDMixin, Base):

    __tablename__ = "audit_logs"

    user_id: Mapped[uuid.UUID | None]

    action: Mapped[str]

    entity_type: Mapped[str]

    entity_id: Mapped[str]

    metadata_json: Mapped[dict] = mapped_column("metadata", JSON)