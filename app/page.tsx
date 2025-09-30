"use client";

import EventFetch from "@/lib/Events";

import TabBar from "@/components/TabBar";
import AddEdit from "@/components/AddEditEvents";
import EventDialogue from "@/components/EventDialogue";
import { useEffect, useState } from "react";

type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  author: string;
}

function Home() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch events from the database
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events_data = await EventFetch();
        setEvents(events_data);
      }
      catch (error) {
        console.error("Error fetching events:", error);
      }
      finally {
        // Update loading state whether successful or not
        setLoading(false)
      }
    }
    fetchEvents();
  }, []);

  return (
    <main className="min-h-screen w-full grid place-items-center" >
      <div className="px-5 min-w-xs md:w-3xl lg:w-5xl min-h-screen flex flex-col gap-10 items-center content-start py-20">
        {/* Tab Bar */}
        <div>
          <TabBar />
        </div>

        {/* Add & Edit */}
        <div>
          <AddEdit />
        </div>

        {/* Event Cards */}
        {loading ? (
          <p>Loading events...</p>
        ) : (
          events.length === 0 ? (
            <p>No events found.</p>
          ) : (
            events.map((event: Event) => (
              <EventDialogue
                key={event.id}
                title={event.title}
                date={event.date}
                time={event.time}
                location={event.location}
                author={event.author}
              />
            ))
          ))}
      </div>
    </main>
  );
}

export default Home;
