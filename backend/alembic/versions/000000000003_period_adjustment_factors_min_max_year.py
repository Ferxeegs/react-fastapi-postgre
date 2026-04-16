"""period_adjustment_factors min_year max_year

Revision ID: 000000000003
Revises: 000000000002
Create Date: 2026-04-16 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "000000000003"
down_revision = "000000000002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "period_adjustment_factors",
        sa.Column("min_year", sa.Integer(), nullable=False, server_default=sa.text("1")),
    )
    op.add_column(
        "period_adjustment_factors",
        sa.Column("max_year", sa.Integer(), nullable=False, server_default=sa.text("5")),
    )
    op.alter_column("period_adjustment_factors", "min_year", server_default=None)
    op.alter_column("period_adjustment_factors", "max_year", server_default=None)


def downgrade() -> None:
    op.drop_column("period_adjustment_factors", "max_year")
    op.drop_column("period_adjustment_factors", "min_year")
