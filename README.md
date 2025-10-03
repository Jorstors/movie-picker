# Movie Picker

Tiny full-stack app for planning movie nights:
- **Frontend:** Next.js 15 + React 19 + Tailwind 4 + shadcn/ui (proxying `/api/*` to the backend).
- **Backend:** FastAPI + psycopg (connection pool) with a simple Events/RSVPs schema on Postgres.

## Quick Start

### Option A — Docker (recommended)
```bash
# From repo root
docker compose -f dockercompose.yml up -d
# Frontend → http://localhost:3000
# Backend  → http://localhost:8000
# Postgres → localhost:5432 (moviepicker/moviepickerpass)
```
- Compose spins up Postgres, runs the schema initializer, then starts the API and UI.

### Option B — Local dev
**Backend**
```bash
# From repo root
pip install -r backend/requirements.txt
export MOVIE_PICKER_DB_URL="postgresql://moviepicker:moviepickerpass@localhost:5432/moviepicker"
uvicorn backend.api:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend**
```bash
# In another shell, from repo root
npm install
# Set LOCAL_DEV so Next proxies to http://localhost:8000
# macOS/Linux:
LOCAL_DEV=TRUE npm run dev
# Windows (cmd):
set LOCAL_DEV=TRUE && npm run dev
```

## Environment Variables
- `MOVIE_PICKER_DB_URL` – Postgres connection string (used by backend pool). Example (docker network): `postgresql://moviepicker:moviepickerpass@postgres:5432/moviepicker`  
- `MOVIE_PICKER_API_URL` – When **not** in local dev, Next proxies `/api/*` to this URL (e.g., `http://backend:8000`).  
- `LOCAL_DEV` – If set, Next uses `http://localhost:8000` for the proxy target.  

## Scripts
```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build --turbopack",
  "start": "next start",
  "lint": "eslint"
}
```

## API (FastAPI)

Base: `/api`

| Method | Path                  | Body                            | Notes |
|---|---|---|---|
| GET  | `/health`              | —                               | Health check. |
| GET  | `/events`              | —                               | Returns latest 15 events. |
| POST | `/events`              | `{ title, genre, date, time, location, author }` | Creates event; returns id. |
| DELETE | `/events/{event_id}` | —                               | Deletes event (cascades RSVPs via FK). |
| GET  | `/rsvps/{event_id}`    | —                               | Returns RSVPs for event (fields: `id`=event_id, `rsvp_id`, `author`, `movie`). |
| POST | `/rsvps`               | `{ id, author, movie }`         | Creates RSVP; conflict on `(event_id, author)` is ignored. |
| DELETE | `/rsvps/{rsvp_id}`   | —                               | Deletes RSVP. |

## Database Schema (Postgres)

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
  UNIQUE (event_id, author)
);
```

- Created at container start by `python -m backend.SQL_UTIL.init_db`.


