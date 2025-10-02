# backend/api.py
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# psycopg using dict row factory
from .SQL_UTIL.db import POOL
from .SQL_UTIL.operations import (
    insert_event,
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
    event_id: int
    movie: str
    author: str


@app.get("/api/health")
async def root():
    return JSONResponse(content={"message": "Welcome to the Events API!"})


@app.get("/api/events")
async def get_events():
    # Sample data representing events
    events = [
        {
            "id": 1,
            "title": "Event 1",
            "genre": "Genre 1",
            "date": "2024-07-01",
            "time": "10:00 AM",
            "location": "Location A",
            "author": "Author 1",
        },
        {
            "id": 2,
            "title": "Event 2",
            "genre": "Genre 2",
            "date": "2024-07-02",
            "time": "02:00 PM",
            "location": "Location B",
            "author": "Author 2",
        },
        {
            "id": 3,
            "title": "Event 3",
            "genre": "Genre 3",
            "date": "2024-07-03",
            "time": "06:00 PM",
            "location": "Location C",
            "author": "Author 3",
        },
        {
            "id": 4,
            "title": "Event 4",
            "genre": "Genre 4",
            "date": "2024-07-04",
            "time": "09:00 AM",
            "location": "Location D",
            "author": "Author 4",
        },
        {
            "id": 5,
            "title": "Event 5",
            "genre": "Genre 5",
            "date": "2024-07-05",
            "time": "11:00 AM",
            "location": "Location E",
            "author": "Author 5",
        },
        {
            "id": 6,
            "title": "Event 6",
            "genre": "Genre 6",
            "date": "2024-07-06",
            "time": "03:00 PM",
            "location": "Location F",
            "author": "Author 6",
        },
    ]
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
            cur.execute(
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
            event_id = event_id["id"]
    return JSONResponse(
        content={
            "message": f"Event '{event.title}' created successfully with id `{event_id}`."
        }
    )


@app.post("/api/rsvps")
async def rsvp_event(RSVP: RSVP):
    return JSONResponse(
        content={"message": f"RSVP for event {RSVP.event_id} created successfully."}
    )
