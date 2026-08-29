"""Community feed endpoints — media-first posts (a shared album or animation),
likes, and comments."""

from fastapi import APIRouter, Depends

from app.api.dependencies import CurrentUser, DbSession
from app.models.community import CommunityPost
from app.repositories.community_repository import CommunityPostRepository, PostCommentRepository, PostLikeRepository
from app.repositories.photo_animation_repository import PhotoAnimationRepository
from app.repositories.photo_repository import PhotoShareRepository
from app.schemas.common import Page
from app.schemas.community import AuthorOut, CommentCreate, CommentOut, CommunityPostCreate, CommunityPostOut
from app.services.community_service import CommunityService
from app.utils.pagination import PaginationParams, build_page_meta

router = APIRouter(prefix="/community", tags=["community"])


def _service(db: DbSession) -> CommunityService:
    return CommunityService(
        CommunityPostRepository(db),
        PostLikeRepository(db),
        PostCommentRepository(db),
        PhotoShareRepository(db),
        PhotoAnimationRepository(db),
    )


def _to_out(post: CommunityPost, viewer_id: int) -> CommunityPostOut:
    if post.photo_animation_id:
        media_type, photo_urls = "animation", []
        media_url = post.photo_animation.output_url
    else:
        media_type = "album"
        photo_urls = [item.photo.url for item in post.photo_share.items]
        media_url = photo_urls[0] if photo_urls else None

    return CommunityPostOut(
        id=post.id,
        caption=post.caption,
        visibility=post.visibility,
        created_at=post.created_at,
        author=AuthorOut(id=post.user.id, name=post.user.name),
        media_type=media_type,
        media_url=media_url,
        photo_urls=photo_urls,
        like_count=len(post.likes),
        comment_count=len(post.comments),
        liked_by_me=any(like.user_id == viewer_id for like in post.likes),
        comments=[
            CommentOut(id=c.id, body=c.body, created_at=c.created_at, author=AuthorOut(id=c.user.id, name=c.user.name))
            for c in post.comments
        ],
    )


@router.get("/feed", response_model=Page[CommunityPostOut])
def get_feed(
    user: CurrentUser,
    pagination: PaginationParams = Depends(),
    service: CommunityService = Depends(_service),
) -> Page[CommunityPostOut]:
    items, total = service.get_feed(user.id, pagination.page, pagination.page_size)
    return Page(
        data=[_to_out(p, user.id) for p in items],
        meta=build_page_meta(total, pagination.page, pagination.page_size),
    )


@router.post("/posts", response_model=CommunityPostOut, status_code=201)
def create_post(
    payload: CommunityPostCreate, user: CurrentUser, service: CommunityService = Depends(_service)
) -> CommunityPostOut:
    post = service.create_post(
        user.id,
        photo_share_id=payload.photo_share_id,
        photo_animation_id=payload.photo_animation_id,
        caption=payload.caption,
        visibility=payload.visibility,
    )
    return _to_out(post, user.id)


@router.delete("/posts/{post_id}", status_code=204)
def delete_post(post_id: int, user: CurrentUser, service: CommunityService = Depends(_service)) -> None:
    service.delete_post(post_id, user.id)


@router.post("/posts/{post_id}/like", response_model=CommunityPostOut)
def like_post(post_id: int, user: CurrentUser, service: CommunityService = Depends(_service)) -> CommunityPostOut:
    service.toggle_like(post_id, user.id)
    return _to_out(service.get_visible(post_id, user.id), user.id)


@router.post("/posts/{post_id}/comments", response_model=CommunityPostOut, status_code=201)
def add_comment(
    post_id: int,
    payload: CommentCreate,
    user: CurrentUser,
    service: CommunityService = Depends(_service),
) -> CommunityPostOut:
    service.add_comment(post_id, user.id, payload.body)
    return _to_out(service.get_visible(post_id, user.id), user.id)


@router.delete("/posts/{post_id}/comments/{comment_id}", status_code=204)
def delete_comment(
    post_id: int, comment_id: int, user: CurrentUser, service: CommunityService = Depends(_service)
) -> None:
    service.delete_comment(post_id, comment_id, user.id)
