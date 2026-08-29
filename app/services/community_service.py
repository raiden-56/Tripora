"""Community feed business logic: posts wrap a shared photo album or an
animation (see app/models/community.py), plus likes and comments."""

from app.core.constants import GenerationStatus, PostVisibility
from app.core.exceptions import ConflictError, NotFoundError, PermissionDeniedError
from app.models.community import CommunityPost, PostComment, PostLike
from app.repositories.community_repository import CommunityPostRepository, PostCommentRepository, PostLikeRepository
from app.repositories.photo_animation_repository import PhotoAnimationRepository
from app.repositories.photo_repository import PhotoShareRepository


class CommunityService:
    def __init__(
        self,
        repo: CommunityPostRepository,
        like_repo: PostLikeRepository,
        comment_repo: PostCommentRepository,
        share_repo: PhotoShareRepository,
        animation_repo: PhotoAnimationRepository,
    ):
        self.repo = repo
        self.like_repo = like_repo
        self.comment_repo = comment_repo
        self.share_repo = share_repo
        self.animation_repo = animation_repo

    def create_post(
        self,
        user_id: int,
        *,
        photo_share_id: int | None,
        photo_animation_id: int | None,
        caption: str | None,
        visibility: PostVisibility,
    ) -> CommunityPost:
        if photo_share_id is not None:
            share = self.share_repo.get(photo_share_id)
            if not share or share.user_id != user_id:
                raise PermissionDeniedError("You can only share an album you own.")
        else:
            animation = self.animation_repo.get(photo_animation_id)
            if not animation or animation.user_id != user_id:
                raise PermissionDeniedError("You can only share an animation you own.")
            if animation.status != GenerationStatus.COMPLETED:
                raise ConflictError("This animation isn't ready to share yet.")

        post = CommunityPost(
            user_id=user_id,
            photo_share_id=photo_share_id,
            photo_animation_id=photo_animation_id,
            caption=caption,
            visibility=visibility,
        )
        return self.repo.add(post)

    def get_feed(self, viewer_id: int, page: int, page_size: int) -> tuple[list[CommunityPost], int]:
        return self.repo.list_feed(viewer_id=viewer_id, page=page, page_size=page_size)

    def get_visible(self, post_id: int, viewer_id: int) -> CommunityPost:
        post = self.repo.get(post_id)
        if not post:
            raise NotFoundError("Post not found.", code="POST_NOT_FOUND")
        if post.visibility == PostVisibility.PRIVATE and post.user_id != viewer_id:
            raise PermissionDeniedError("You do not have access to this post.")
        return post

    def delete_post(self, post_id: int, user_id: int) -> None:
        post = self.repo.get(post_id)
        if not post:
            raise NotFoundError("Post not found.", code="POST_NOT_FOUND")
        if post.user_id != user_id:
            raise PermissionDeniedError("You can only delete your own posts.")
        self.repo.delete(post)

    def toggle_like(self, post_id: int, user_id: int) -> bool:
        """Returns True if the post is now liked, False if the like was removed."""
        self.get_visible(post_id, user_id)
        existing = self.like_repo.get_for_post_and_user(post_id, user_id)
        if existing:
            self.like_repo.delete(existing)
            return False
        self.like_repo.add(PostLike(post_id=post_id, user_id=user_id))
        return True

    def add_comment(self, post_id: int, user_id: int, body: str) -> PostComment:
        self.get_visible(post_id, user_id)
        comment = PostComment(post_id=post_id, user_id=user_id, body=body)
        return self.comment_repo.add(comment)

    def delete_comment(self, post_id: int, comment_id: int, user_id: int) -> None:
        post = self.get_visible(post_id, user_id)
        comment = self.comment_repo.get(comment_id)
        if not comment or comment.post_id != post_id:
            raise NotFoundError("Comment not found.", code="COMMENT_NOT_FOUND")
        if comment.user_id != user_id and post.user_id != user_id:
            raise PermissionDeniedError("You can only delete your own comments.")
        self.comment_repo.delete(comment)
