# Travel Diaries

**Your personal travel memory map.**
_Remember where you've been. Plan where you're going._

Travel Diaries turns your scattered travel history — old photos, forgotten wishlists, half-planned trips, random Drive folders — into one living, visual map of your life on the road. It's not a booking site and it's not another admin-style dashboard. It's the thing between a travel journal, a personal map, a trip planner, and a memory vault.

---

## Why this exists

Most people's travel data lives nowhere in particular:

- Photos are scattered across phones, WhatsApp, and random Drive folders.
- "Places to visit" lists live in Notes apps and die there.
- Trip planning happens in a messy group chat, then gets forgotten.
- There's no single place that shows _"here's everywhere I've actually been."_

Booking apps (MakeMyTrip, Airbnb, Google Travel) are built to sell you the **next** trip. Journaling apps (Notion, Day One) aren't built for **geography**. Photo apps (Google Photos) aren't built for **travel intent** (visited vs. planned vs. dream destinations). Travel Diaries fills that specific gap: a map-first, memory-first personal travel system.

## Who it's for

- Travelers who want a visual record of everywhere they've been — by country, state, or city.
- People maintaining a "bucket list" who want it to turn into real, plannable trips instead of a dead note.
- Anyone who takes trip photos and wants them organized _by destination_, not by camera roll date.
- Groups planning a trip who need shared checklists, budgets, and a countdown, not another spreadsheet.
- Travel creators/enthusiasts who want a shareable, beautiful public "journey page" instead of a plain Instagram grid.

## What makes it useful (not just pretty)

| Need                                                         | How Travel Diaries solves it                                                                                                                      |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Where have I actually been?"                                | An interactive world + India map with visited / planned / wishlist markers, state-by-state India Explorer progress, and real travel statistics.   |
| "I keep forgetting places I wanted to visit."                | A structured wishlist with priority levels and one-tap "Add to Planned."                                                                          |
| "My photos are a mess."                                      | Memories and photos are attached directly to a destination — Coorg's photos live under Coorg, not buried in a camera roll.                        |
| "My trip photos are in Drive, disconnected from everything." | Each destination can link a Google Drive folder, so files stay organized and one click away (API-ready for a real integration).                   |
| "I don't know what to plan next."                            | A "What's Next?" engine recommends destinations based on states/countries you've already explored and your favorites — not a generic top-10 list. |
| "Planning a trip is chaotic."                                | Upcoming trips get countdowns, shared checklists, and category-level budget tracking (planned vs. actual).                                        |
| "I want to show off my travel year."                         | An automatic Yearly Recap and a shareable public journey page, built for social sharing rather than a static PDF.                                 |
| "I don't know where to start planning."                      | Canvas AI reads your travel history and answers real planning questions ("I have 3 days and ₹10,000" / "Plan a 4-day Coorg trip").                |

## Standing up to the market

- **vs. booking platforms** — no upsells, no "you might also like this hotel" noise. It's about _memory and progress_, not a transaction.
- **vs. generic note/journal apps** — geography-first: every entry is a place on a real map, not a bullet point.
- **vs. photo apps** — photos are organized by _destination and trip_, with context (dates, notes, tags, ratings) instead of just timestamps.
- **vs. spreadsheets for trip planning** — checklists, budgets, and countdowns live next to the actual destination, not in a separate file nobody opens twice.

## Product loop

```
Remember → Explore → Plan → Travel → Capture → Share → Remember
```

Every visit becomes a memory, every memory feeds recommendations, every recommendation turns into a plan, and every completed trip becomes something worth sharing — which is what brings the next person in.

## Feature highlights

- Interactive world & India maps with custom status markers (visited / planned / wishlist / favorite)
- India Explorer progress (states & UTs) and World Explorer stats
- Destination detail drawer: overview, places, memories, photos, notes, files, timeline
- Location-based memories with a masonry photo gallery and full-screen viewer
- Google Drive folder linking per destination (integration-ready)
- Upcoming trips with countdowns, checklists, and budget tracking
- Travel bucket list with priority levels
- Travel statistics dashboard (countries, states, trips, memories, activity by year)
- Achievements/gamification tied to real progress, not arbitrary badges
- Canvas AI — mock but architecture-ready travel assistant & itinerary generator
- Yearly recap with social share cards
- Public, shareable journey page with private/friends/public visibility
- Light & dark mode, fully responsive (desktop sidebar, mobile bottom nav)

## Tech stack

**Frontend** (`/web`): React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · React Router · Zustand · Leaflet / React-Leaflet

**Backend** (`/app`): FastAPI · SQLAlchemy 2.0 · PostgreSQL (SQLite for local dev) · Alembic · Redis (caching + rate limiting) · Celery (background jobs) · JWT auth

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full system design and [API.md](API.md) for API conventions.

## Getting started

**Backend** (no Docker required — defaults to SQLite and gracefully runs without Redis):

```bash
python -m venv .venv
.venv\Scripts\activate            # or: source .venv/bin/activate
pip install -e ".[dev]"
copy .env.example .env
alembic upgrade head
python -m scripts.seed             # seeds demo users, destinations, guide, pricing plans
uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd web
npm install
npm run dev
```

Log in with the seeded demo account on the login screen, or click **Explore Demo** on the landing page:

```
Email:    demo@traveldiaries.com
Password: Travel@123
```

**Or run everything with Docker Compose** (Postgres + Redis + API + Celery worker + built frontend):

```bash
docker compose up --build
```

```bash
cd web && npm run build   # production frontend build
pytest tests/backend      # backend test suite
```

## Status

Travel Diaries is now a full-stack application. Authentication, destinations, trip planning,
guide bookings, photo sharing, AI travel stories, and pricing are wired end-to-end to a real
FastAPI + PostgreSQL backend — no hardcoded credentials or fake data in those flows. A few
secondary pages (trips/memories UI, statistics, achievements) still read from the frontend's
local store while their equivalent backend APIs are already implemented and tested; wiring them
follows the same pattern already used for destinations and pricing. See
[ARCHITECTURE.md](ARCHITECTURE.md#4-whats-intentionally-still-on-the-frontends-local-zustand-mock-store)
for the exact current state.
