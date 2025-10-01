// Helper function to fetch and return a list of events

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

export default EventFetch;
