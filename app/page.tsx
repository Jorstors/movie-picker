// app/page.tsx
"use client";

export const dynamic = "force-dynamic";

import EventFetch from "@/lib/Events";

import TabBar from "@/components/TabBar";
import AddEdit from "@/components/AddEditEvents";
import EventDialogue from "@/components/EventDialogue";
import { createContext, useEffect, useState, Suspense } from "react";
import type { Event } from "@/lib/types";
import PromptName from "@/components/PromptName";

type userContextType = {
  user: string;
  setUser: React.Dispatch<React.SetStateAction<string>>;
}

const userContext = createContext<userContextType>({} as userContextType);

function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState("");
  const [refresh, setRefresh] = useState<number>(0);

  useEffect(() => {
    console.log("User context updated:", user);
  }, [user]);

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
  }, [refresh]);

  return (
    <userContext.Provider value={{ user, setUser }}>
      <main className="min-h-screen w-full grid place-items-center bg-gradient-to-b from-background to-card" >
        <div className="px-5 min-w-xs md:w-3xl lg:w-5xl min-h-screen flex flex-col gap-10 items-center content-start py-20">
          {/* User Name Context */}
          <PromptName />

          {/* Tab Bar */}
          <div>
            <TabBar />
          </div>

          {/* Add & Edit */}
          <div>
            <AddEdit
              onSuccess={() => setRefresh((prev) => prev + 1)}
            />
          </div>

          {/* Event Cards */}
          {loading ? (
            <p>Loading events...</p>
          ) : (
            events.length === 0 ? (
              <p>No events found.</p>
            ) : (
              <Suspense fallback={<p>Loading events...</p>}>
                {
                  events.map((event: Event) => (
                    <EventDialogue
                      key={event.id}
                      id={event.id}
                      title={event.title}
                      genre={event.genre}
                      date={event.date}
                      time={event.time}
                      location={event.location}
                      author={event.author}
                      onSuccess={() => setRefresh((prev) => prev + 1)}
                    />
                  ))
                }
              </Suspense>
            ))}
        </div>
      </main>
    </userContext.Provider>
  );
}

export default Home;
export type { Event };
export { userContext };
