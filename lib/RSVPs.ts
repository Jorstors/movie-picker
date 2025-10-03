// Helper function to fetch and return a list of RSVPs

async function RSVPsFetch(eventID: number) {
  try {
    const res = await fetch("/api/rsvps/" + eventID);
    const events_data = await res.json();

    return events_data["rsvps"];
  }
  catch (error) {
    console.error("Error fetching events:", error);
    return []; // Return an empty array in case of error
  }
}

async function RSVPsDelete(rsvpID: number) {
  try {
    const res = await fetch("/api/rsvps/" + rsvpID, {
      method: "DELETE"
    })
    if (res.ok) {
      console.log("RSVP deleted successfully");
    }
  }
  catch (error) {
    console.error("Error deleting RSVP:", error);
  }
}

export default RSVPsFetch;
export { RSVPsDelete };
