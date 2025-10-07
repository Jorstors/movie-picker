# backend/api.py
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from psycopg.sql import SQL, Identifier, Literal

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


class EventPatch(BaseModel):
    title: str | None = None
    genre: str | None = None
    date: str | None = None
    time: str | None = None
    location: str | None = None
    author: str | None = None


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


@app.patch("/api/events/{event_id}")
def patch_event(event_id: int, event: EventPatch):
    fields: list[str] = []
    values: list[str] = []

    if event.title is not None:
        fields.append("title = %s")
        values.append(event.title)
    if event.genre is not None:
        fields.append("genre = %s")
        values.append(event.genre)
    if event.date is not None:
        fields.append("date = %s")
        values.append(event.date)
    if event.time is not None:
        fields.append("time = %s")
        values.append(event.time)
    if event.location is not None:
        fields.append("location = %s")
        values.append(event.location)
    if event.author is not None:
        fields.append("author = %s")
        values.append(event.author)

    if not fields:
        return JSONResponse(
            status_code=400,
            content={"message": "No fields provided for update."},
        )

    values.append(str(event_id))
    set_clause = SQL(", ").join(Identifier(field) for field in fields)
    # f string can't be used with psycopg safely apparently
    query = SQL("UPDATE events SET {set_clause} WHERE id = %s").format(
        set_clause=set_clause
    )

    with POOL.connection() as conn:
        with conn.cursor() as cur:
            _ = cur.execute(query, tuple(values))

    return JSONResponse(content={"message": f"Event {event_id} updated successfully."})
