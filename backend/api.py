# backend/api.py
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from psycopg.sql import SQL, Identifier

# psycopg using dict row factory
from .SQL_UTIL.db import POOL
from .SQL_UTIL.operations import (
    get_event_winner_query,
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
    event_id: int
    movie: str
    author: str
    weight: int | None = 1


class RSVPPatch(BaseModel):
    movie: str | None = None
    author: str | None = None
    weight: int | None = None


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
            _ = cur.execute(insert_rsvp, (RSVP.event_id, RSVP.author, RSVP.movie))
            # Returns the rsvp_id of the newly created RSVP
            res = cur.fetchone()
            rsvp_id = res["id"] if res else -1
    return JSONResponse(
        content={
            "message": f"RSVP for event {RSVP.event_id} created successfully with id {rsvp_id}"
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
    cols: list[str] = []
    vals: list[str] = []

    if event.title is not None:
        cols.append("title")
        vals.append(event.title)
    if event.genre is not None:
        cols.append("genre")
        vals.append(event.genre)
    if event.date is not None:
        cols.append("date")
        vals.append(event.date)
    if event.time is not None:
        cols.append("time")
        vals.append(event.time)
    if event.location is not None:
        cols.append("location")
        vals.append(event.location)
    if event.author is not None:
        cols.append("author")
        vals.append(event.author)

    if not cols:
        return JSONResponse(
            status_code=400, content={"message": "No fields provided for update."}
        )

    # "column" = %s, "column2" = %s, ...
    set_clause = SQL(", ").join(SQL("{} = %s").format(Identifier(col)) for col in cols)

    query = SQL("UPDATE events SET {} WHERE id = %s RETURNING id").format(set_clause)

    with POOL.connection() as conn:
        with conn.cursor() as cur:
            _ = cur.execute(query, (*vals, event_id))
            if not cur.fetchone():
                return JSONResponse(
                    status_code=404, content={"message": f"Event {event_id} not found"}
                )

    return JSONResponse(
        content={"message": f"Event {event_id} patched", "updated_fields": cols}
    )


@app.patch("/api/rsvps/{rsvp_id}")
def patch_rsvp(rsvp_id: int, rsvp: RSVPPatch):
    cols: list[str] = []
    vals: list[str | int] = []

    if rsvp.movie is not None:
        cols.append("movie")
        vals.append(rsvp.movie)
    if rsvp.author is not None:
        cols.append("author")
        vals.append(rsvp.author)
    if rsvp.weight is not None:
        cols.append("weight")
        vals.append(rsvp.weight)

    if not cols:
        return JSONResponse(
            status_code=400, content={"message": "No fields provided for update."}
        )

    # "column" = %s, "column2" = %s, ...
    set_clause = SQL(", ").join(SQL("{} = %s").format(Identifier(col)) for col in cols)

    query = SQL("UPDATE rsvps SET {} WHERE id = %s RETURNING id").format(set_clause)

    with POOL.connection() as conn:
        with conn.cursor() as cur:
            _ = cur.execute(query, (*vals, rsvp_id))
            if not cur.fetchone():
                return JSONResponse(
                    status_code=404, content={"message": f"RSVP {rsvp_id} not found"}
                )

    return JSONResponse(
        content={"message": f"RSVP {rsvp_id} patched", "updated_fields": cols}
    )


@app.get("/api/events/winner/{event_id}")
def get_event_winner(event_id: int):
    with POOL.connection() as conn:
        with conn.cursor() as cur:
            _ = cur.execute(get_event_winner_query, (event_id,))
            winner = cur.fetchone()
            if not winner:
                return JSONResponse(
                    status_code=404,
                    content={"message": f"No winner found for event {event_id}"},
                )
            rsvp_winner_id = winner["rsvp_id"] if winner else None
    return JSONResponse(content={"rsvp_winner_id": rsvp_winner_id})
