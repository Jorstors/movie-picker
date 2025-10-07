# Movie Picker

Tiny full‑stack app for planning movie nights.

- **Frontend:** Next.js 15 (App Router) + React 19 + Tailwind CSS v4 + shadcn/ui
- **Backend:** FastAPI (uvicorn) + psycopg + Postgres 16
- **Proxy:** Next rewrites `/api/*` → backend (local or container), controlled by envs

## Quick Start

### Option A — Docker (recommended)
```bash
# from repo root
docker compose -f dockercompose.yml up -d

# URLs
# Frontend → http://localhost:3000
# Backend  → http://localhost:8000
# Postgres → localhost:5432 (db: moviepicker / user: moviepicker / pass: moviepickerpass)
```
Compose spins up Postgres, runs the schema initializer, then starts API and UI.

### Option B — Local Dev
**Backend**
```bash
pip install -r backend/requirements.txt
export MOVIE_PICKER_DB_URL="postgresql://moviepicker:moviepickerpass@localhost:5432/moviepicker"
uvicorn backend.api:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend**
```bash
npm install
# Set LOCAL_DEV so Next proxies to http://localhost:8000
# macOS/Linux
LOCAL_DEV=TRUE npm run dev
# Windows (cmd)
set LOCAL_DEV=TRUE && npm run dev
```

## Environment

- `MOVIE_PICKER_DB_URL` – Postgres connection string (backend uses a psycopg pool).
  - Example (Docker network): `postgresql://moviepicker:moviepickerpass@postgres:5432/moviepicker`
- `MOVIE_PICKER_API_URL` – Backend base URL for the proxy in production/containers (e.g. `http://backend:8000`).
- `LOCAL_DEV` – If set, Next uses `http://localhost:8000` as the proxy target. If **not** set, it uses `MOVIE_PICKER_API_URL`.

## API (FastAPI, base `/api`)

| Method | Path                  | Body / Notes |
|-------:|-----------------------|--------------|
| GET    | `/health`             | Health check. |
| GET    | `/events`             | Returns latest 15 events. |
| POST   | `/events`             | `{ title, genre, date, time, location, author }` → creates event (returns id). |
| PATCH  | `/events/{event_id}`  | Partial update on any fields above. |
| DELETE | `/events/{event_id}`  | Deletes an event (RSVPs cascade via FK). |
| GET    | `/rsvps/{event_id}`   | RSVPs for an event. Fields: `id` (event_id), `rsvp_id`, `author`, `movie`, `weight`. |
| POST   | `/rsvps`              | `{ id, author, movie }` where `id` is the event id. Conflict on `(event_id, author)` is ignored. |
| PATCH  | `/rsvps/{rsvp_id}`    | Partial update on `{ movie?, author?, weight? }`. |
| DELETE | `/rsvps/{rsvp_id}`    | Deletes an RSVP. |

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  genre VARCHAR(255),
  date VARCHAR(255) NOT NULL,
  time VARCHAR(50) NOT NULL,
  location VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS rsvps (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  author VARCHAR(255) NOT NULL,
  movie VARCHAR(255) NOT NULL,
  weight INT DEFAULT 1,
  UNIQUE (event_id, author)
);
```
Schema is created on container start by `python -m backend.SQL_UTIL.init_db` (run via the `initialize` service in `dockercompose.yml`).

## Scripts

```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build --turbopack",
  "start": "next start",
  "lint": "eslint"
}
```

## Notes

- Frontend proxies all `/api/*` calls (see `next.config.ts` rewrites).
- Calendar page is currently a placeholder/WIP.
- Dockerfiles: `dockerfile.frontend` and `dockerfile.backend` are built into `jorstors/movie-picker-fe:latest` and `jorstors/movie-picker-be:latest` (see `dockercompose.yml`).

---

Made with ❤️ for quick movie‑night planning.
