# Travel Diaries — Architecture

This document describes the full-stack architecture: the public website + web app frontend, the FastAPI backend, the data model, and how the two talk to each other. For end-user documentation see [USER_GUIDE.md](USER_GUIDE.md). For the OpenAPI contract, run the backend and visit `/docs` (Swagger) or `/redoc`.

## 1. High-level architecture

```
                    ┌──────────────────────┐
                    │  Public Website +    │
                    │   Web App  (/web)    │
                    └──────────┬───────────┘
                               │  HTTPS / JSON (fetch)
                               ▼
                    ┌──────────────────────┐
                    │   FastAPI Backend     │
                    │       (/app)          │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        PostgreSQL           Redis          Celery worker
       (SQLAlchemy +       (cache +        (AI blog generation,
         Alembic)        rate limiting)     notifications)
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                 Integrations (Google Drive link validation,
                 AI provider, payment provider, object storage)
                 — all behind swappable interfaces in app/integrations/
```

## 2. Repository layout

```
web/            React + TypeScript frontend (public website + authenticated app)
app/            FastAPI backend package
  api/v1/       Route handlers, grouped by resource
  core/         Config, security (JWT/bcrypt), exceptions, logging, cache
  db/           SQLAlchemy engine/session/declarative base
  models/       SQLAlchemy ORM models (one file per aggregate)
  schemas/      Pydantic request/response models
  repositories/ Thin data-access layer (no business logic)
  services/     Business logic (one class per bounded context)
  integrations/ Swappable adapters: AI, Google Drive, payments, storage
  tasks/        Celery app + background tasks (blog generation, notifications)
  middleware/   Rate limiting, request logging
  utils/        Pagination, small shared validators
alembic/        Database migrations
scripts/seed.py Demo data seed script
tests/backend/  pytest suite (SQLite in-memory, isolated per test)
docs/           Screenshots + supplementary docs
docker-compose.yml, Dockerfile, docker/  Container setup
```

The frontend was moved from the project root into `web/` without changing any of its
components, pages, styling, or routing — only its location changed.

## 3. What's fully wired end-to-end today

These flows go all the way: frontend → `fetch` → FastAPI → Pydantic validation → service →
repository → SQLAlchemy → PostgreSQL (or SQLite in dev) → response → frontend state.

- **Authentication** — signup, login, JWT access/refresh tokens (with rotation + revocation),
  logout, forgot-password. `web/src/store/useAuthStore.ts` calls the real API; there is no
  hardcoded credential check left in the frontend.
- **Destinations** — list/create/update/delete, backed by `web/src/api/destinations.api.ts`.
- **Pricing plans** — the Upgrade page fetches `/api/v1/pricing/plans` from the database
  instead of a hardcoded array.
- **Trip planner** — `POST /api/v1/planner/generate` runs a real (rule-based, deterministic)
  itinerary generator and persists the result; nothing here is a stub.
- **Guide marketplace & bookings** — guide profiles, search/filter, booking request →
  accept/reject/complete workflow, and reviews are fully implemented and persisted.
- **AI travel stories ("blogs")** — `POST /api/v1/blogs/generate` creates a `PENDING` blog and
  runs generation via Celery (falling back to a FastAPI `BackgroundTask` if no Celery worker/
  broker is available), so it never blocks the request.
- **Photo sharing** — upload (validated, stored via the storage abstraction), and secure
  shareable albums via unguessable tokens (`GET /share/{token}`, public, no auth).
- **Subscriptions & payments** — `POST /api/v1/subscriptions` creates a subscription + payment
  record through the Razorpay adapter interface (returns a `pending` intent until real
  `PAYMENT_KEY`/`PAYMENT_SECRET` are configured).
- **Admin** — user/guide/booking listing and aggregate reports, gated by `role=ADMIN`.
- **Notifications** — created on booking events, listable/markable-as-read per user.
- **Rate limiting & caching** — Redis-backed, both degrade to "disabled" (never "crash") if
  Redis isn't running, which is the default in local dev without Docker.

## 4. What's computed on the client, and what isn't built yet

Every user-owned record (destinations, trips + checklist + planned budget, memories, photos,
profile, notifications) now loads from and saves to the API; `web/src/store/useAppStore.ts`
starts empty and is hydrated by `fetchAllData()`. Marketing pages and onboarding suggestions
still use showcase data from `web/src/data/mockData.ts`.

Derived views are computed in the browser from that real data rather than stored:
statistics (`utils/stats.ts`), achievements (`utils/achievements.ts`), travel score,
"What's Next" suggestions (`utils/recommendations.ts`), the yearly recap, and Canvas AI
(`utils/aiAssistant.ts`, the offline assistant used when no AI key is configured). The public journey page is the exception: it is served by
`GET /api/v1/public/journeys/{handle}` so it works for anonymous visitors, and only when the
owner's visibility is "public".

AI: with `AI_API_KEY` set, Canvas AI chat (`/assistant/chat`), the Trip Planner and travel
stories use Claude (`app/integrations/ai/claude_provider.py`); without it, or if the API fails,
they fall back to the offline/template logic and the UI says which one answered.

Not built yet (see `docs/AUDIT_AND_PLAN.md`): calendar view, admin dashboard, password reset
email, payments, Google Drive sync.

## 5. Deliberate simplifications (and why)

- **Destination "category" and "status" are columns, not lookup tables.** A full
  `destination_categories` / `destination_statuses` table would add joins for no real benefit
  at this schema's size; the enum/string columns are indexed and simple to evolve.
- **Wishlist has no separate table.** It's the `wishlist` value of `Destination.status` —
  matching how the existing frontend already modeled it. A separate table would just duplicate
  the same row with a different status.
- **Guides are tied to a `destination_name` string, not a user's personal `Destination` row.**
  A local guide operates in a _place_ (e.g. "Coorg"), not in one specific traveler's saved
  destination record — conflating the two would be a modeling error.
- **AI blog generation uses a deterministic template provider by default**
  (`app/integrations/ai/template_provider.py`), not a live LLM call, since no `AI_API_KEY` is
  assumed to be present. It implements the same `AIProvider` interface a real
  OpenAI/Anthropic-backed provider would, so swapping it in is a one-file change.
- **Payments use a Razorpay adapter that returns a "pending" intent** until real
  `PAYMENT_KEY`/`PAYMENT_SECRET` are configured — this keeps the subscription flow (plan
  selection → subscription record → payment record) fully testable without a live payment
  account, while the provider is fully swappable via `app/integrations/payments/`.
- **Local disk storage is the default `StorageService`**, not S3/R2/GCS, until
  `STORAGE_BUCKET`/`STORAGE_ACCESS_KEY`/`STORAGE_SECRET_KEY` are configured. Only the
  `StorageService` interface needs a new implementation to switch.

## 6. Database

PostgreSQL in production (via `DATABASE_URL`), SQLite for local dev/tests by default (no setup
required) — the same SQLAlchemy models and Alembic migrations work against both. Every
user-owned table has a `user_id` foreign key and every read/write goes through a service that
checks ownership (`get_owned` pattern) before returning or mutating a row — enforced in the
backend, not just hidden in the UI.

Run migrations:

```
alembic upgrade head
python -m scripts.seed   # optional: demo users, destinations, guide, pricing plans
```

## 7. Auth & roles

JWT access tokens (short-lived) + refresh tokens (rotated on use, hashed at rest, revocable).
Three roles: `USER`, `GUIDE`, `ADMIN`. `app/api/dependencies.py` exposes `get_current_user` and
`require_role(...)` as FastAPI dependencies — every protected route declares its own
requirement explicitly.

## 8. Running locally

**Backend (no Docker required for development):**

```
python -m venv .venv
.venv\Scripts\activate            # or: source .venv/bin/activate
pip install -e ".[dev]"
copy .env.example .env             # defaults to SQLite + no Redis; both degrade gracefully
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --reload
```

**Frontend:**

```
cd web
npm install
npm run dev
```

**Full stack via Docker Compose** (Postgres + Redis + API + Celery worker + built frontend
behind nginx):

```
docker compose up --build
```

## 9. Tests

```
pytest tests/backend
```

Tests run against an isolated in-memory SQLite database per test (never your dev `.env`
database), via a `get_db` dependency override in `tests/backend/conftest.py`.
