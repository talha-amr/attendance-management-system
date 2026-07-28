"""add student role server default

Revision ID: b2db814b1d17
Revises: 0158413dbc94
Create Date: 2026-07-27 21:40:27.879480

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2db814b1d17'
down_revision: Union[str, Sequence[str], None] = '0158413dbc94'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
    "ALTER TABLE users "
    "ALTER COLUMN role "
    "SET DEFAULT 'STUDENT'::user_roles"
)


def downgrade() -> None:
    op.execute(
        "ALTER TABLE users "
        "ALTER COLUMN role "
        "DROP DEFAULT"
    )
    # ### end Alembic commands ###
