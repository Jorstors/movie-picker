// Helper function to fetch and return a list of events

import { Event } from "./types";

async function EventFetch() {
  /*
   * Return the events list from the backend API
   * Expected format:
   * {
   * "events": [
    * {
    * "id": "1",
    * "title": "Event 1",
    * "date": "2023-10-01",
    * "time": "10:00 AM",
    * "location": "Location 1",
    * "author": "Author 1"
    * }
    * ]
   * }
   * */
  try {
    const res = await fetch("/api/events");
    const events_data = await res.json();

    return events_data["events"];
  }
  catch (error) {
    console.error("Error fetching events:", error);
    return []; // Return an empty array in case of error
  }
}

async function EventDelete(event_id: number) {
  try {
    const res = await fetch(`/api/events/${event_id}`, {
      method: "DELETE"
    })
    if (res.ok) {
      console.log("Event deleted successfully");
    }
  }
  catch (error) {
    console.error("Error deleting event:", error);
    return;
  }
}

async function EventCreate(event: Event) {
  try {
    const response = await fetch("/api/events", {
      method: "POST",
      body: JSON.stringify(event),
      headers: {
        "Content-Type": "application/json"
      }
    })
    if (response.ok) {
      console.log("Event created successfully");
    }
  }
  catch (error) {
    console.error("Error creating event:", error);
    alert("There was an error creating the event. Please try again.");
  }

}

async function checkEventWinner(event_id: number) {
  try {
    const response = await fetch(`/api/events/winner/${event_id}`)
    if (response.ok) {
      const data = await response.json();
      const rsvp_winner_id = data["rsvp_winner_id"];

      if (rsvp_winner_id) {
        return rsvp_winner_id;
      }
    }
    else if (response.status === 404) {
      console.log("Event has no winner yet.");
      return undefined;
    }
  }
  catch (error) {
    console.error("Error checking event winner:", error);
    return;
  }
}

export default EventFetch;
export { EventDelete, EventCreate, checkEventWinner };
