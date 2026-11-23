"""fix foreign keys server defaults and search index

Revision ID: e8b193f45c21
Revises: 37be0a80c8f2
Create Date: 2026-11-24 01:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'e8b193f45c21'
down_revision: Union[str, Sequence[str], None] = '37be0a80c8f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Foreign Key cascade fixes
    # Update reviews.user_id FK with ON DELETE CASCADE
    try:
        op.drop_constraint('reviews_user_id_fkey', 'reviews', type_='foreignkey')
    except Exception:
        pass
    op.create_foreign_key(
        'reviews_user_id_fkey',
        'reviews',
        'users',
        ['user_id'],
        ['id'],
        ondelete='CASCADE'
    )

    # Update books.user_id FK with ON DELETE SET NULL
    try:
        op.drop_constraint('books_user_id_fkey', 'books', type_='foreignkey')
    except Exception:
        pass
    op.create_foreign_key(
        'books_user_id_fkey',
        'books',
        'users',
        ['user_id'],
        ['id'],
        ondelete='SET NULL'
    )

    # 2. Add server_default=now() for timestamp consistency
    tables = ['books', 'users', 'reviews', 'conversations', 'messages']
    for tbl in tables:
        try:
            op.alter_column(tbl, 'created_at', server_default=sa.text('now()'), existing_type=sa.DateTime(timezone=True))
            op.alter_column(tbl, 'updated_at', server_default=sa.text('now()'), existing_type=sa.DateTime(timezone=True))
        except Exception:
            pass

    # 3. Drop redundant single index covered by composite index
    try:
        op.drop_index('ix_messages_conversation_id', table_name='messages')
    except Exception:
        pass

    # 4. Trigram extension and gin index for fast wildcard search
    try:
        op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
        op.execute("""
            CREATE INDEX IF NOT EXISTS ix_books_search_trgm 
            ON books USING gin ((title || ' ' || author || ' ' || publisher) gin_trgm_ops);
        """)
    except Exception:
        pass


def downgrade() -> None:
    # Revert search index
    try:
        op.execute("DROP INDEX IF EXISTS ix_books_search_trgm;")
    except Exception:
        pass

    # Revert redundant index
    try:
        op.create_index('ix_messages_conversation_id', 'messages', ['conversation_id'])
    except Exception:
        pass

    # Revert server_default
    tables = ['books', 'users', 'reviews', 'conversations', 'messages']
    for tbl in tables:
        try:
            op.alter_column(tbl, 'created_at', server_default=None, existing_type=sa.DateTime(timezone=True))
            op.alter_column(tbl, 'updated_at', server_default=None, existing_type=sa.DateTime(timezone=True))
        except Exception:
            pass

    # Revert foreign keys
    try:
        op.drop_constraint('books_user_id_fkey', 'books', type_='foreignkey')
        op.create_foreign_key('books_user_id_fkey', 'books', 'users', ['user_id'], ['id'])
    except Exception:
        pass

    try:
        op.drop_constraint('reviews_user_id_fkey', 'reviews', type_='foreignkey')
        op.create_foreign_key('reviews_user_id_fkey', 'reviews', 'users', ['user_id'], ['id'])
    except Exception:
        pass
