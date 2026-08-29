"""community feed

Revision ID: f5d5a34fccc1
Revises: 58f121ba01dd
Create Date: 2026-08-29 21:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f5d5a34fccc1'
down_revision: Union[str, Sequence[str], None] = '58f121ba01dd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('community_posts',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('photo_share_id', sa.Integer(), nullable=True),
    sa.Column('photo_animation_id', sa.Integer(), nullable=True),
    sa.Column('caption', sa.String(length=500), nullable=True),
    sa.Column('visibility', sa.Enum('PUBLIC', 'PRIVATE', name='postvisibility'), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['photo_animation_id'], ['photo_animations.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['photo_share_id'], ['photo_shares.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_community_posts_created_at'), 'community_posts', ['created_at'], unique=False)
    op.create_index(op.f('ix_community_posts_user_id'), 'community_posts', ['user_id'], unique=False)
    op.create_index(op.f('ix_community_posts_visibility'), 'community_posts', ['visibility'], unique=False)
    op.create_table('post_comments',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('post_id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('body', sa.String(length=500), nullable=False),
    sa.Column('is_reported', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['post_id'], ['community_posts.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_post_comments_created_at'), 'post_comments', ['created_at'], unique=False)
    op.create_index('ix_post_comments_post', 'post_comments', ['post_id'], unique=False)
    op.create_index(op.f('ix_post_comments_post_id'), 'post_comments', ['post_id'], unique=False)
    op.create_index(op.f('ix_post_comments_user_id'), 'post_comments', ['user_id'], unique=False)
    op.create_table('post_likes',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('post_id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['post_id'], ['community_posts.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_post_likes_created_at'), 'post_likes', ['created_at'], unique=False)
    op.create_index(op.f('ix_post_likes_post_id'), 'post_likes', ['post_id'], unique=False)
    op.create_index('ix_post_likes_post_user', 'post_likes', ['post_id', 'user_id'], unique=True)
    op.create_index(op.f('ix_post_likes_user_id'), 'post_likes', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_post_likes_user_id'), table_name='post_likes')
    op.drop_index('ix_post_likes_post_user', table_name='post_likes')
    op.drop_index(op.f('ix_post_likes_post_id'), table_name='post_likes')
    op.drop_index(op.f('ix_post_likes_created_at'), table_name='post_likes')
    op.drop_table('post_likes')
    op.drop_index(op.f('ix_post_comments_user_id'), table_name='post_comments')
    op.drop_index(op.f('ix_post_comments_post_id'), table_name='post_comments')
    op.drop_index('ix_post_comments_post', table_name='post_comments')
    op.drop_index(op.f('ix_post_comments_created_at'), table_name='post_comments')
    op.drop_table('post_comments')
    op.drop_index(op.f('ix_community_posts_visibility'), table_name='community_posts')
    op.drop_index(op.f('ix_community_posts_user_id'), table_name='community_posts')
    op.drop_index(op.f('ix_community_posts_created_at'), table_name='community_posts')
    op.drop_table('community_posts')
