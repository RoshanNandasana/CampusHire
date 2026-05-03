"""add missing student columns

Revision ID: f2b5d0c9a1e7
Revises: 9a4d2e11f8c2
Create Date: 2026-05-03 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "f2b5d0c9a1e7"
down_revision = "9a4d2e11f8c2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("students", sa.Column("phone", sa.String(length=20), nullable=True))
    op.add_column("students", sa.Column("date_of_birth", sa.String(length=20), nullable=True))
    op.add_column("students", sa.Column("university_id", sa.String(length=100), nullable=True))
    op.add_column("students", sa.Column("preferred_role", sa.String(length=255), nullable=True))
    op.add_column("students", sa.Column("profile_image", sa.Text(), nullable=True))
    op.add_column("students", sa.Column("linkedin_url", sa.String(length=500), nullable=True))
    op.add_column("students", sa.Column("github_url", sa.String(length=500), nullable=True))
    op.add_column("students", sa.Column("portfolio_url", sa.String(length=500), nullable=True))

    op.add_column(
        "student_skills",
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.add_column(
        "student_skills",
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.add_column(
        "student_skills",
        sa.Column("proficiency", sa.String(length=50), nullable=False, server_default=sa.text("'intermediate'")),
    )
    op.add_column(
        "student_skills",
        sa.Column("years_of_experience", sa.Float(), nullable=False, server_default=sa.text("0")),
    )
    op.add_column(
        "student_skills",
        sa.Column("endorsement_count", sa.Integer(), nullable=False, server_default=sa.text("0")),
    )


def downgrade() -> None:
    op.drop_column("student_skills", "endorsement_count")
    op.drop_column("student_skills", "years_of_experience")
    op.drop_column("student_skills", "proficiency")
    op.drop_column("student_skills", "updated_at")
    op.drop_column("student_skills", "created_at")

    op.drop_column("students", "portfolio_url")
    op.drop_column("students", "github_url")
    op.drop_column("students", "linkedin_url")
    op.drop_column("students", "profile_image")
    op.drop_column("students", "preferred_role")
    op.drop_column("students", "university_id")
    op.drop_column("students", "date_of_birth")
    op.drop_column("students", "phone")
