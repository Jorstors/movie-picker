// Helper function to fetch and return a list of RSVPs

import { RSVP } from "./types";

async function RSVPsFetch(eventID: number) {
  try {
    const res = await fetch("/api/rsvps/" + eventID);
    const rsvps_data = await res.json();

    console.log("Fetched RSVPs:", rsvps_data["rsvps"]);

    return rsvps_data["rsvps"];
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

async function RSVPsCreate(rsvp: RSVP) {
  try {
    const response = await fetch("/api/rsvps", {
      method: "POST",
      body: JSON.stringify(rsvp),
      headers: {
        "Content-Type": "application/json"
      }
    })
    if (response.ok) {
      console.log("RSVP created successfully");
    }
  }
  catch (error) {
    console.error("Error creating RSVP:", error);
  }
}

export default RSVPsFetch;
export { RSVPsDelete, RSVPsCreate };
