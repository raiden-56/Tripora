"""AI travel-story generation, processed via a background task (see tasks/blog_tasks.py)."""

from app.core.constants import GenerationStatus
from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.integrations.ai.template_provider import get_ai_provider
from app.models.blog import Blog, BlogSection
from app.repositories.blog_repository import BlogRepository


class BlogService:
    def __init__(self, repo: BlogRepository):
        self.repo = repo

    def create_pending(self, user_id: int, *, trip_id: int | None, title: str) -> Blog:
        blog = Blog(user_id=user_id, trip_id=trip_id, title=title, status=GenerationStatus.PENDING)
        return self.repo.add(blog)

    def get_owned(self, blog_id: int, user_id: int) -> Blog:
        blog = self.repo.get(blog_id)
        if not blog:
            raise NotFoundError("Blog not found.", code="BLOG_NOT_FOUND")
        if blog.user_id != user_id:
            raise PermissionDeniedError("You do not have access to this blog.")
        return blog

    def list_for_user(self, user_id: int) -> list[Blog]:
        return self.repo.list_for_user(user_id)

    def delete(self, blog_id: int, user_id: int) -> None:
        self.repo.delete(self.get_owned(blog_id, user_id))

    def process_generation(self, blog_id: int, facts: dict) -> None:
        """Runs the (mock or real) AI provider and stores the result. Called from the
        Celery task — kept synchronous/pure here so it's independently testable."""
        blog = self.repo.get(blog_id)
        if not blog:
            return
        blog.status = GenerationStatus.PROCESSING
        self.repo.db.commit()

        try:
            provider = get_ai_provider()
            sections = provider.generate_blog_sections(title=blog.title, facts=facts)
            blog.sections = [
                BlogSection(order_index=i, heading=s["heading"], content=s["content"])
                for i, s in enumerate(sections)
            ]
            blog.summary = sections[0]["content"] if sections else None
            blog.status = GenerationStatus.COMPLETED
        except Exception as exc:  # noqa: BLE001 - generation failures must not crash the worker
            blog.status = GenerationStatus.FAILED
            blog.error_message = str(exc)
        self.repo.db.commit()
