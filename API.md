# Travel Diaries API — Overview

The authoritative API contract is the live OpenAPI spec: run the backend and visit `/docs`
(Swagger UI) or `/redoc`. This document covers conventions that apply across all endpoints.

## Base URL & versioning

All endpoints are under `/api/v1`. `/health` (no prefix) is used for container health checks.

## Authentication

Send `Authorization: Bearer <access_token>` on every protected request. Get a token pair from:

```
POST /api/v1/auth/login       { "email": "...", "password": "..." }
POST /api/v1/auth/signup      { "first_name", "last_name", "email", "password" }
POST /api/v1/auth/refresh     { "refresh_token": "..." }
POST /api/v1/auth/logout      { "refresh_token": "..." }
```

Access tokens expire in `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` (default 30). Refresh tokens rotate on
every use — the old one is revoked as soon as a new pair is issued.

Demo accounts (seeded by `scripts/seed.py`, **development only**):

| Email                   | Password   | Role  |
| ----------------------- | ---------- | ----- |
| demo@traveldiaries.com  | Travel@123 | USER  |
| ashok@traveldiaries.com | Ashok@123  | USER  |
| guide@traveldiaries.com | Guide@123  | GUIDE |
| admin@traveldiaries.com | Admin@123  | ADMIN |

## Response envelope

Successful list endpoints return:

```json
{ "data": [...], "meta": { "page": 1, "page_size": 20, "total": 42, "total_pages": 3 } }
```

Errors always look like:

```json
{
  "error": {
    "code": "DESTINATION_NOT_FOUND",
    "message": "Destination not found."
  }
}
```

Never a raw stack trace, even on unexpected `500` errors.

## Pagination

List endpoints accept `page` (default 1) and `page_size` (default 20, max 100) query params.

## Rate limiting

Redis-backed, per-IP, applied to auth endpoints (`login`, `signup`, `forgot-password`:
`RATE_LIMIT_LOGIN_PER_MINUTE`, default 5/min) and AI-driven endpoints (`planner/generate`:
`RATE_LIMIT_AI_PER_MINUTE`, default 10/min). Exceeding a limit returns `429` with
`code: "RATE_LIMITED"`. If Redis is unreachable, rate limiting is disabled rather than blocking
all traffic.

## Key resources

| Resource           | Base path                                                 | Notes                                                              |
| ------------------ | --------------------------------------------------------- | ------------------------------------------------------------------ |
| Destinations       | `/destinations`                                           | Owned by the authenticated user; status = visited/planned/wishlist |
| Trips              | `/trips`                                                  | Links to destinations via `destination_ids`                        |
| Memories           | `/memories`                                               | Tied to a destination, optionally a trip                           |
| Photos             | `/photos`, `/photos/share`, `/share/{token}`              | Upload (max 10 MB, jpeg/png/webp) + public share links             |
| Google Drive links | `/drive-links`                                            | Stores/validates a Drive folder URL only — no OAuth                |
| Guides             | `/guides`, `/guides/{id}/booking`, `/guides/{id}/reviews` | Search, book, review                                               |
| Bookings           | `/bookings`                                               | A traveler's or guide's bookings, with status transitions          |
| Trip planner       | `/planner/generate`, `/planner`                           | Generates + persists a day-by-day itinerary                        |
| Blogs              | `/blogs/generate`, `/blogs`                               | Async AI travel-story generation                                   |
| Pricing            | `/pricing/plans`                                          | Public, no auth required                                           |
| Subscriptions      | `/subscriptions`, `/subscriptions/me`                     | Creates a pending payment intent                                   |
| Notifications      | `/notifications`                                          | Per-user, markable as read                                         |
| Admin              | `/admin/*`                                                | Requires `role=ADMIN`                                              |

## Background processing

`POST /blogs/generate` returns `202 Accepted` immediately with a `blog_id` and `status: pending`.
Generation runs via Celery if a worker + Redis broker are available (see `docker-compose.yml`'s
`worker` service), otherwise it falls back to an inline FastAPI `BackgroundTask` — either way the
HTTP request never blocks on the AI call. Poll `GET /blogs/{id}` until `status` becomes
`completed` or `failed`.
