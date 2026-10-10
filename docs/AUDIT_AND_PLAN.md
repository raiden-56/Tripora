# Tripora (Travel Diaries) — Audit & Completion Plan

_Audit date: 2026-10-10 · audited commit `f5c8184` (main)_

Method: full static read of `app/` (backend) and `web/` (frontend), comparison with the older
`reference/Tripora` implementation, plus hands-on checks — backend test suite, frontend
type-check/build/lint, and a click-through of every page as the seeded demo user against a
local API on SQLite.

---

## 1. Health check results

| Check | Result |
|---|---|
| `pytest tests/backend` (before fixes) | **33 passed, 3 failed** — the 3 failures are a test-isolation bug (photo-animation background task opens its own `SessionLocal()` against the real `travel_diaries.db` instead of the in-memory test DB). They only passed before when that file happened to be migrated. |
| `npm run build` (tsc + vite) | Passes. Single 840 kB JS chunk (no code-splitting). |
| `oxlint` | 4 warnings (setState inside effects in the 3 modals). |
| Alembic models vs migrations | **No drift** — all 33 tables match. |
| Local stack (SQLite, no Redis) | API healthy, demo login works, all pages render. |

## 2. What works (wired end-to-end, persisted)

- **Auth**: signup, login, JWT access + rotating refresh tokens, logout.
- **Destinations**: CRUD with owner checks, filters, map markers.
- **Trips**: CRUD, multi-destination, **collaborators** (invite / accept / roles).
- **Expenses**: participants, split expenses, balances & settle-up (owner only).
- **Memories**: create / list / delete, photos attached.
- **Photo Hub**: upload, delete, share albums by token (public `/share/:token` page), GIF **animations**.
- **Community feed**: post animations, like, comment, delete.
- **Trip Planner**: generates and saves a day-by-day plan (rule-based, not AI).
- **Guides marketplace**: become a guide, search, request booking, accept / decline.
- **Pricing plans** page reads plans from the DB.
- The frontend store is **no longer on mock data** — everything loads from the API.
  (`ARCHITECTURE.md` §4 still claims otherwise; it is out of date.)

## 3. What is broken or unsafe

### Backend — P0 (security / data integrity)
1. **Celery worker never registers tasks** (`app/tasks/celery_app.py` has no `include`) → under
   Docker, AI stories and photo animations stay "pending" forever.
2. **Default JWT secret** used by Docker (`docker-compose.yml` `${JWT_SECRET:-change-me-in-production}`)
   and nothing blocks it in production.
3. **Admin with a known password** (`admin@traveldiaries.com` / `Admin@123`) re-seeded on every
   container start; seed also bypasses Alembic with `create_all`.
4. **Upload path traversal on Windows** — filename only has `/` stripped (`photo_service.py:49`).
5. **Stored XSS via uploads** — type is checked only by client `Content-Type`; original
   extension kept; `/uploads` served as static files (an `.html`/`.svg` is served as such).
6. **Missing ownership checks on referenced IDs** — memories (`destination_id`, `trip_id`),
   photos (`destination_id`, `memory_id`), drive links, trip `destination_ids`, animation `trip_id`.
7. **Guide reviews can be forged** — review's booking isn't matched to the guide; travelers can
   set their own booking to COMPLETED; guides can book themselves.

### Backend — P1 (crashes / wrong behaviour)
8. SQLite never enforces foreign keys → deleting a posted animation or shared photo makes the
   **whole community feed 500** for everyone.
9. Explicit `null` in any update body → 500 (IntegrityError) instead of 422.
10. Many string fields lack `max_length` → fine on SQLite, **500 on Postgres**.
11. Redis absent: every rate-limited/cached call pays a reconnect timeout (~0.5–1 s); Redis
    dropping mid-run → 500s.
12. Refresh doesn't check `is_active`; `/refresh` and `/logout` aren't rate-limited.
13. Alembic downgrades leave enum types behind on Postgres (re-upgrade fails).
14. Password reset is a stub (no token, no email, no reset endpoint).
15. Payments are fake; `/subscriptions/me` returns pending subscriptions as current.

### Frontend — P0 (broken features)
16. **Mobile users can't reach** Settings, Logout, Memories, Photos, Community, Planner, Guides,
    AI, Statistics or Journeys (bottom nav has 5 items; sidebar hidden below `md`).
17. **Trips can never become "visited"** — no status field → "Trips completed", achievements and
    the journey timeline stay empty.
18. **No favorite toggle anywhere**, yet Profile / Discover / Recap depend on favorites.
19. Dashboard trip **Delete does nothing**; Edit / "View all" go to the wrong page.
20. Editing a trip collapses multi-destination trips and can send `destination_ids: [0]`.
21. **Public journey page** shows the *viewer's own* data, ignores `:handle`, empty for anonymous
    visitors; the backend has no public endpoint; links hard-coded to `/u/ganesh`.
22. Trip **checklist & budget tabs** are always empty and toggles aren't saved (no backend).
23. Destination "Google Drive folder" field is silently dropped; fields can't be cleared on edit.
24. Guide bookings can't be marked completed → reviews impossible end-to-end.

### Frontend — P1 (fake / misleading)
25. Success toasts and modal close even when the save failed (store swallows errors).
26. Profile bio captured stale at mount — saving can wipe it.
27. Onboarding throws away all input (interests, places, wishlist).
28. Canvas AI is fully local/fake (setTimeout + templates) and duplicates the Planner.
29. Settings: export, delete journey/account, Drive connect are toast-only; notification toggle
    not persisted.
30. Notifications bell is computed client-side with wrong rules; backend notifications unused.
31. `/app/recap` and `/app/upgrade` are unreachable; recap hard-codes "2026" and "ganesh".
32. No delete confirmations (memory, photos bulk, destination); empty states flash while loading.
33. Production Docker build has no `VITE_API_BASE_URL` → browser calls `localhost:8000`.
34. Tokens persisted wholesale in localStorage; multi-tab refresh logs every tab out.

## 4. Missing features (README promises / older reference app)

| Feature | Status |
|---|---|
| Itinerary builder / day editor on a trip (+ "save planner result as trip") | Missing |
| Smart packing list | Missing (checklist tab is a stub) |
| Planned trip budget vs actual | Missing (only expense-splitting exists) |
| Weather on trips | Placeholder only |
| Calendar view of trips | Missing |
| Real AI (Canvas AI chat, travel stories, planner) | Template stubs only |
| Statistics / achievements / recap | Computed client-side only (OK for now) |
| Public journey page with visibility | Missing backend |
| Admin dashboard UI | Missing (API is read-only) |
| Payments (Razorpay), email (password reset), Google Drive OAuth, S3 storage | Stubs — need accounts/keys |

---

## 5. Plan

Phases are ordered so each one leaves the app shippable. Phase 1 and 2 need no product
decisions; Phase 3 and 4 do.

### Phase 1 — Stabilise & secure (backend + infra) — ✅ done (branch `fix/phase-1-stabilise`)
- [x] 1.1 Test isolation: background tasks resolve `SessionLocal` at call time and tests point it
      at the per-test DB; Redis is disabled under tests. Suite went from 132 s to ~20 s.
- [x] 1.2 Celery `include=[...]` — worker now registers `generate_blog`, `generate_animation`,
      `send_notification`.
- [x] 1.3 App refuses to start outside development/test with a shipped/short `JWT_SECRET`;
      docker-compose no longer overrides `.env.development`'s secret with the public default.
- [x] 1.4 Seed refuses to run outside development/test; no more `create_all` (Alembic owns schema).
- [x] 1.5 Uploads: bytes verified with Pillow (JPEG/PNG/WEBP only), server-generated filename +
      verified extension, path-escape guard in local storage, decompression-bomb limit, EXIF
      `taken_at`, `nosniff` + sandbox CSP on `/uploads`.
- [x] 1.6 `ReferenceGuard` checks every referenced ID (memories, photos, drive links, trip
      destinations, animation trips) — someone else's row answers 404.
- [x] 1.7 Booking state machine (guide: accept/reject → complete/cancel; traveler: cancel),
      guide can view their bookings, review must match the booking's guide, no self-booking or
      past dates.
- [x] 1.8 `PatchModel`: explicit `null` on a NOT NULL field → 422; optional fields can be cleared;
      `max_length`/range limits on all request schemas; trip end ≥ start; visibility enum.
      Global `IntegrityError`/`DataError` handlers → 409/422 instead of 500.
- [x] 1.9 SQLite `PRAGMA foreign_keys=ON` (dev + tests); feed serializer tolerates missing media.
- [x] 1.10 Shared Redis client with 30 s back-off; every Redis op failure degrades, never 500s;
      limiter runs in the threadpool.
- [x] 1.11 Refresh refuses deactivated users; `/refresh`, `/logout`, `/blogs/generate`,
      `/photos/animations` rate-limited.
- [x] 1.12 Migrations: downgrades drop their enum types (Postgres round-trip verified).
      _Audit item "upgrade re-creates `generationstatus`" was a false alarm — fresh and
      incremental upgrades both work on Postgres 16._
- [x] 1.13 `tests/backend/test_hardening.py` (17 tests). Found and fixed one more bug: creating a
      guide with no languages returned 500.

**Result:** 53 tests pass on SQLite **and** on Postgres 16
(`TEST_DATABASE_URL=postgresql+psycopg://…/empty_db pytest`).

### Phase 2 — Make every existing screen honest — ✅ done (branch `feat/phase-2-honest-ui`)
Backend (migration `7a8e5c369d54`, 11 new tests in `test_phase2_api.py`):
- [x] Trip checklist (`/trips/{id}/checklist`) and planned budget vs actual spend
      (`/trips/{id}/budget`) — any member reads, owner/editors write.
- [x] Public journeys `GET /public/journeys/{handle}` (only when visibility is public);
      handles auto-generated at signup, editable and validated (reserved words, uniqueness).
- [x] `PUT /users/me` (name), `GET /users/me/export`, `DELETE /users/me` (password-confirmed,
      removes uploaded files too); profile stores notification + onboarding preferences.
- [x] Notifications: unread count, mark-all-read, `created_at`, respects the user's preference.
- [x] Planner get/delete; bookings carry guide/traveler names and a `reviewed` flag;
      destinations store a Drive folder URL.
- [x] Honest forgot-password message (no email is sent yet).

Frontend:
- [x] 2.1 Mobile "More" sheet with every page + log out; sidebar log out; Recap and Plans in nav.
- [x] 2.2 Trips: planned/completed status, "back from this trip?" prompt, past trips,
      multi-destination picker, date validation, owner-only edit/delete, deep links
      (`?trip=`, `?plan=`), Dashboard actions fixed.
- [x] 2.3 Favorite toggle on cards, drawer and "What's Next".
- [x] 2.4 Store actions report success → no false success toasts; shared confirm dialog on every
      destructive action; `fetchAllData` de-duplicated.
- [x] 2.5 Optional fields can be cleared (`pickBody` sends null); Drive folder persisted.
- [x] 2.6 Public journey page fetches by handle (works logged-out); recap year picker and real
      share links; Plans page says "coming soon" instead of faking checkout.
- [x] 2.7 Checklist and budget tabs backed by the API.
- [x] 2.8 Notification bell uses backend notifications (polls unread count).
- [x] 2.9 Onboarding saves visited states, wishlist picks and interests.
- [x] 2.10 Guides: cancel, complete, review, names, extra search filters.
- [x] 2.11 Planner: delete, save as trip, null-safe numbers; Canvas AI labelled as rule-based.
- [x] 2.12 Settings: real export, account deletion, persisted notification preference,
      fake Drive/"delete journey" actions removed; Google/Apple sign-in buttons removed.
- [x] 2.13 API client wraps network errors/timeouts; single base URL + `mediaUrl()`;
      `VITE_API_BASE_URL` build arg for the Docker image; tokens persisted per "Remember me"
      and synced across tabs.
- [x] 2.14 Docs updated.

Known gaps carried forward: Discover's "Near you" still assumes Bangalore; "friends"
visibility behaves like private (no friends graph); counters animate with
requestAnimationFrame so they show 0 in a backgrounded tab until it's visible.

### Phase 3 — New features — ✅ done (branch `feat/phase-3-itinerary`)
- [x] Itinerary day editor on trips — stops per day (time, type, cost, notes), day names,
      reorder/move, import from a Trip Planner result; "Save as trip" creates a real itinerary.
- [x] Packing suggestions from trip length, expected weather, places and itinerary.
- [x] Weather on trips (Open-Meteo, no key): forecast ≤ 16 days out, same dates last year
      for later trips, recorded weather for past trips.
- [x] Real AI (Claude, `claude-opus-5-5`) behind `AI_API_KEY`: Canvas AI chat grounded in the
      traveler's own data (`/assistant/chat`), AI day-by-day planning, AI travel stories. JSON
      schema outputs, server-side refusal fallback, prompt caching for chat context; every path
      falls back to the offline/template logic when the key is missing or the API fails, and the
      UI says which one answered. The rule-based planner no longer invents budgets/distances.
- [x] Calendar view (`/app/calendar`): month grid with trips and visits; picking a day shows
      that day's itinerary stops.
- [x] Admin dashboard (`/app/admin`, admins only): usage overview, user search with
      activate/deactivate (signs the user out) and role changes (no self-lockout), guide
      verification, bookings list.
- [x] Bundle code-splitting: pages load on demand (main bundle 840 kB → 511 kB, 236 → 150 kB
      gzipped); unknown URLs show a "Page not found" page instead of a blank screen.

### Phase 4 — Integrations that need accounts
- Email provider (password reset, invites), Razorpay checkout + webhooks, Google OAuth / Drive,
  S3/R2 storage, production deployment.
