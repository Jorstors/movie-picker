# Movie Picker

Tiny full‑stack app for planning movie nights.

- **Frontend:** Next.js 15 (App Router) + React 19 + Tailwind CSS v4 + shadcn/ui
- **Backend:** FastAPI (uvicorn) + psycopg + Postgres 16
- **Proxy:** Next rewrites `/api/*` → backend (local or container), controlled by envs

## Quick Start (Updated)

### Docker (recommended)

1. Create a `.env` file in the repo root with your Radarr credentials:

```bash
MOVIE_PICKER_RADARR_URL=http://radarr:7878
MOVIE_PICKER_RADARR_API_KEY=YOUR_RADARR_API_KEY
```

2. Start everything:
```bash
docker compose -f dockercompose.yml up -d
```

**URLs**
- Frontend → http://localhost:3000  
- Backend  → http://localhost:8000  
- Postgres → localhost:5432 (`moviepicker` / `moviepickerpass`)

Compose runs Postgres, initializes the schema, and launches the backend, watcher, and frontend.  
The watcher requires the two Radarr variables.

---

### Local Dev

**Backend**
```bash
pip install -r backend/requirements.txt
export MOVIE_PICKER_DB_URL="postgresql://moviepicker:moviepickerpass@localhost:5432/moviepicker"
uvicorn backend.api:app --reload
```

(Optional)
```bash
export MOVIE_PICKER_RADARR_URL="http://localhost:7878"
export MOVIE_PICKER_RADARR_API_KEY="YOUR_KEY"
python -m backend.watcher
```

**Frontend**
```bash
npm install
LOCAL_DEV=TRUE npm run dev
```

---

### Environment Variables

| Variable | Description |
|-----------|--------------|
| MOVIE_PICKER_DB_URL | Postgres connection string |
| MOVIE_PICKER_API_URL | Backend URL for proxy (default `http://backend:8000`) |
| LOCAL_DEV | If set, proxies to localhost:8000 |
| MOVIE_PICKER_RADARR_URL | Radarr base URL |
| MOVIE_PICKER_RADARR_API_KEY | Radarr API key |


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
