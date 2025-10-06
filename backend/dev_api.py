# backend/api.py
from fastapi import FastAPI
from fastapi.responses import JSONResponse
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
    movie: str
    author: str


@app.get("/api/health")
async def root():
    return JSONResponse(content={"message": "Welcome to the Events API!"})


@app.get("/api/events")
async def get_events():
    events = [
        {
            "id": "1",
            "title": "Movie Night",
            "genre": "Action",
            "date": "2023/10/01",
            "time": "19:00",
            "location": "123 Main St",
            "author": "Alice",
        },
        {
            "id": "2",
            "title": "Comedy Fest",
            "genre": "Comedy",
            "date": "2023/10/05",
            "time": "20:00",
            "location": "456 Elm St",
            "author": "Bob",
        },
        {
            "id": "3",
            "title": "Horror Marathon",
            "genre": "Horror",
            "date": "2023/10/10",
            "time": "21:00",
            "location": "789 Oak St",
            "author": "Charlie",
        },
        {
            "id": "4",
            "title": "Romantic Evening",
            "genre": "Romance",
            "date": "2023/10/14",
            "time": "18:00",
            "location": "321 Pine St",
            "author": "Diana",
        },
        {
            "id": "5",
            "title": "Sci-Fi Spectacular",
            "genre": "Sci-Fi",
            "date": "2023/10/20",
            "time": "19:30",
            "location": "654 Maple St",
            "author": "Eve",
        },
        {
            "id": "6",
            "title": "Documentary Day",
            "genre": "Documentary",
            "date": "2023/10/25",
            "time": "17:00",
            "location": "987 Birch St",
            "author": "Frank",
        },
        {
            "id": "7",
            "title": "Animated Adventures",
            "genre": "Animation",
            "date": "2023/10/30",
            "time": "16:00",
            "location": "159 Cedar St",
            "author": "Grace",
        },
        {
            "id": "8",
            "title": "Thriller Thursday",
            "genre": "Thriller",
            "date": "2023/11/02",
            "time": "20:30",
            "location": "753 Spruce St",
            "author": "Hank",
        },
        {
            "id": "9",
            "title": "Fantasy Friday",
            "genre": "Fantasy",
            "date": "2023/11/10",
            "time": "19:45",
            "location": "852 Willow St",
            "author": "Ivy",
        },
        {
            "id": "10",
            "title": "Classic Cinema",
            "genre": "Classic",
            "date": "2023/11/15",
            "time": "18:30",
            "location": "951 Chestnut St",
            "author": "Jack",
        },
    ]
    return JSONResponse(content={"events": events})


@app.get("/api/rsvps/{event_id}")
async def get_rsvps(event_id: int):
    rsvps = [
        {"id": event_id, "rsvp_id": "1", "author": "Alice", "movie": "Inception"},
    ]
    return JSONResponse(content={"rsvps": rsvps})


@app.post("/api/events")
async def create_event(event: Event):
    event_id = 0
    return JSONResponse(
        content={
            "message": f"Event '{event.title}' created successfully with id `{event_id}`."
        }
    )


@app.post("/api/rsvps")
async def rsvp_event(RSVP: RSVP):
    return JSONResponse(content={"message": "RSVP for event created successfully."})


@app.delete("/api/events/{event_id}")
async def delete_event(event_id: int):
    return JSONResponse(content={"message": f"Event {event_id} deleted successfully."})


@app.delete("/api/rsvps/{rsvp_id}")
async def delete_rsvp(rsvp_id: int):
    return JSONResponse(content={"message": f"RSVP {rsvp_id} deleted successfully."})
