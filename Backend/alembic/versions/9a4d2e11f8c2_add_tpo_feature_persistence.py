"""add tpo feature persistence fields

Revision ID: 9a4d2e11f8c2
Revises: c1170775c357
Create Date: 2026-03-14 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9a4d2e11f8c2"
down_revision: Union[str, Sequence[str], None] = "c1170775c357"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "study_materials",
        sa.Column("is_global", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "study_materials",
        sa.Column("department_id", sa.UUID(), nullable=True),
    )
    op.create_index(op.f("ix_study_materials_department_id"), "study_materials", ["department_id"], unique=False)
    op.create_foreign_key(
        op.f("fk_study_materials_department_id"),
        "study_materials",
        "departments",
        ["department_id"],
        ["id"],
    )

    op.add_column(
        "material_access",
        sa.Column("access_type", sa.String(length=20), nullable=False, server_default="VIEW"),
    )
    op.add_column(
        "material_access",
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.add_column(
        "material_access",
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index(op.f("ix_material_access_access_type"), "material_access", ["access_type"], unique=False)

    op.create_table(
        "application_eligibility_snapshots",
        sa.Column("application_id", sa.UUID(), nullable=False),
        sa.Column("student_id", sa.UUID(), nullable=False),
        sa.Column("job_id", sa.UUID(), nullable=False),
        sa.Column("department_id", sa.UUID(), nullable=False),
        sa.Column("min_cgpa", sa.Float(), nullable=True),
        sa.Column("max_backlogs", sa.Integer(), nullable=True),
        sa.Column("student_cgpa", sa.Float(), nullable=False),
        sa.Column("student_backlogs", sa.Integer(), nullable=False),
        sa.Column("is_eligible", sa.Boolean(), nullable=False),
        sa.Column("captured_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(["application_id"], ["job_applications.id"], name=op.f("fk_application_eligibility_snapshots_application_id")),
        sa.ForeignKeyConstraint(["department_id"], ["departments.id"], name=op.f("fk_application_eligibility_snapshots_department_id")),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"], name=op.f("fk_application_eligibility_snapshots_job_id")),
        sa.ForeignKeyConstraint(["student_id"], ["students.id"], name=op.f("fk_application_eligibility_snapshots_student_id")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_application_eligibility_snapshots")),
        sa.UniqueConstraint("application_id", name=op.f("uq_application_eligibility_snapshots_application_id")),
    )
    op.create_index(op.f("ix_application_eligibility_snapshots_application_id"), "application_eligibility_snapshots", ["application_id"], unique=False)
    op.create_index(op.f("ix_application_eligibility_snapshots_department_id"), "application_eligibility_snapshots", ["department_id"], unique=False)
    op.create_index(op.f("ix_application_eligibility_snapshots_job_id"), "application_eligibility_snapshots", ["job_id"], unique=False)
    op.create_index(op.f("ix_application_eligibility_snapshots_student_id"), "application_eligibility_snapshots", ["student_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_application_eligibility_snapshots_student_id"), table_name="application_eligibility_snapshots")
    op.drop_index(op.f("ix_application_eligibility_snapshots_job_id"), table_name="application_eligibility_snapshots")
    op.drop_index(op.f("ix_application_eligibility_snapshots_department_id"), table_name="application_eligibility_snapshots")
    op.drop_index(op.f("ix_application_eligibility_snapshots_application_id"), table_name="application_eligibility_snapshots")
    op.drop_table("application_eligibility_snapshots")

    op.drop_index(op.f("ix_material_access_access_type"), table_name="material_access")
    op.drop_column("material_access", "updated_at")
    op.drop_column("material_access", "created_at")
    op.drop_column("material_access", "access_type")

    op.drop_constraint(op.f("fk_study_materials_department_id"), "study_materials", type_="foreignkey")
    op.drop_index(op.f("ix_study_materials_department_id"), table_name="study_materials")
    op.drop_column("study_materials", "department_id")
    op.drop_column("study_materials", "is_global")
