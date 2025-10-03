# backend/api.py
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# psycopg using dict row factory
from .SQL_UTIL.db import POOL
from .SQL_UTIL.operations import (
    get_rsvps_for_event,
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
    rsvps = []
    with POOL.connection() as conn:
        with conn.cursor() as cur:
            _ = cur.execute(get_rsvps_for_event, (event_id,))
            rsvps = cur.fetchall()

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
    # TODO:
    # USE WILL's API KEY FOR RADARR DOWNLOAD ON HIS SERVER
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
