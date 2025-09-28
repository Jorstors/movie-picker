from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()


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
            "date": "2024-07-01",
            "time": "10:00 AM",
            "location": "Location A",
            "author": "Author 1",
        },
        {
            "id": 2,
            "title": "Event 2",
            "date": "2024-07-02",
            "time": "02:00 PM",
            "location": "Location B",
            "author": "Author 2",
        },
        {
            "id": 3,
            "title": "Event 3",
            "date": "2024-07-03",
            "time": "06:00 PM",
            "location": "Location C",
            "author": "Author 3",
        },
        {
            "id": 4,
            "title": "Event 4",
            "date": "2024-07-04",
            "time": "09:00 AM",
            "location": "Location D",
            "author": "Author 4",
        },
        {
            "id": 5,
            "title": "Event 5",
            "date": "2024-07-05",
            "time": "11:00 AM",
            "location": "Location E",
            "author": "Author 5",
        },
    ]
    return JSONResponse(content={"events": events})
