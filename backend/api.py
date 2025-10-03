# backend/api.py
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# psycopg using dict row factory
from .SQL_UTIL.db import POOL
from .SQL_UTIL.operations import (
    insert_event,
    insert_rsvp,
    delete_event_query,
    delete_rsvp_query,
    get_events_query,
)
from pydantic import BaseModel

app = FastAPI()


class Event(BaseModel):
    title: str
    genre: str
    date: str
    time: str
    location: str
    author: str


class RSVP(BaseModel):
    id: int
    movie: str
    author: str


@app.get("/api/health")
async def root():
    return JSONResponse(content={"message": "Welcome to the Events API!"})


@app.get("/api/events")
async def get_events():
    events = []
    with POOL.connection() as conn:
        with conn.cursor() as cur:
            _ = cur.execute(get_events_query)
            events = cur.fetchall()

    return JSONResponse(content={"events": events})


@app.get("/api/rsvps/{event_id}")
async def get_rsvps(event_id: int):
    rsvps = [
        {"id": "Requesting RSVPs", "movie": "For", "author": f"Event ID: {event_id}"},
        {"id": "1", "movie": "Inception", "author": "Alice"},
        {"id": "2", "movie": "The Matrix", "author": "Bob"},
        {"id": "3", "movie": "Interstellar", "author": "Charlie"},
        {"id": "4", "movie": "The Dark Knight", "author": "Diana"},
        {"id": "5", "movie": "Pulp Fiction", "author": "Eve"},
        {"id": "6", "movie": "Forrest Gump", "author": "Frank"},
        {"id": "7", "movie": "The Shawshank Redemption", "author": "Grace"},
        {"id": "8", "movie": "The Godfather", "author": "Hank"},
        {"id": "9", "movie": "Fight Club", "author": "Ivy"},
        {"id": "10", "movie": "The Lord of the Rings", "author": "Jack"},
    ]
    return JSONResponse(content={"rsvps": rsvps})


@app.post("/api/events")
async def create_event(event: Event):
    event_id = 0
    with POOL.connection() as conn:
        with conn.cursor() as cur:
            _ = cur.execute(
                insert_event,
                (
                    event.title,
                    event.genre,
                    event.date,
                    event.time,
                    event.location,
                    event.author,
                ),
            )
            event_id = cur.fetchone()
            if not event_id:
                return JSONResponse(
                    status_code=500,
                    content={"message": "Failed to create event."},
                )
            event_id = event_id["id"] if event_id else -1
    return JSONResponse(
        content={
            "message": f"Event '{event.title}' created successfully with id `{event_id}`."
        }
    )


@app.post("/api/rsvps")
async def rsvp_event(RSVP: RSVP):
    with POOL.connection() as conn:
        with conn.cursor() as cur:
            _ = cur.execute(insert_rsvp, (RSVP.id, RSVP.author, RSVP.movie))
            res = cur.fetchone()
            rsvp_id = res["id"] if res else -1
    return JSONResponse(
        content={
            "message": f"RSVP for event {RSVP.id} created successfully with id {rsvp_id}"
        }
    )


@app.delete("/api/events/{event_id}")
async def delete_event(event_id: int):
    with POOL.connection() as conn:
        with conn.cursor() as cur:
            # change this
            _ = cur.execute(delete_event_query, (event_id,))
    return JSONResponse(content={"message": f"Event {event_id} deleted successfully."})


@app.delete("/api/rsvps/{rsvp_id}")
async def delete_rsvp(rsvp_id: int):
    with POOL.connection() as conn:
        with conn.cursor() as cur:
            _ = cur.execute((delete_rsvp_query), (rsvp_id,))
    return JSONResponse(content={"message": f"RSVP {rsvp_id} deleted successfully."})
