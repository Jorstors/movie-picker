"use client";

import { createContext, useState } from "react";
import React from "react";
import { Event } from "./types";

type EventContextType = {
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
}

const EventContext = createContext<EventContextType>({} as EventContextType);

export default function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);

  return (
    <EventContext.Provider value={{ events, setEvents }}>
      {children}
    </EventContext.Provider>
  )

}

export { EventContext };
