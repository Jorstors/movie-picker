"use client";

import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import { Suspense, useContext, useEffect } from "react";
import { EventContext } from "@/lib/EventProvider";
import EventFetch from "@/lib/Events";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const localizer = momentLocalizer(moment);

function formatDate(date: string, time: string) {
  // Event data is in "MM/DD/YYYY" format for date and "HH24:MI" for time
  const [month, day, year] = date.split("/").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

export default function CalendarPage() {
  return (
    <Suspense >
      <CalendarPageInner />
    </Suspense>
  )
}

function CalendarPageInner() {
  const { events, setEvents } = useContext(EventContext);
  const router = useRouter();
  const searchParams = useSearchParams();

  const formattedEvents = events.map((event) => ({
    title: event.title,
    start: formatDate(event.date, event.time),
    end: new Date(formatDate(event.date, event.time).getTime() + 3 * 60 * 60 * 1000),
    id: event.id,
  }));

  console.log("Events: ", events);
  console.log("Formatted Events for Calendar: ", formattedEvents);

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
    }
    fetchEvents();
  }, [setEvents]);

  return (
    <div className="w-screen h-screen p-4 bg-white text-neutral-600">
      <Calendar
        localizer={localizer}
        events={formattedEvents}
        startAccessor="start"
        endAccessor="end"
        defaultView={Views.WEEK}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        popup
        style={{ height: "100%" }}
        onSelectEvent={(event) => {
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.set("event", event.id?.toString() || "");
          router.push(`/?${newSearchParams.toString()}`);
        }}
      />
      {/* Floating back button */}
      <div className="fixed bottom-4 left-4 bg-background">
        <Link href="/">
          <Button
            variant="default"
            size="icon"
            className="hover:cursor-pointer size-10 sm:size-15">
            <ChevronLeftIcon
              className="size-5 sm:size-7 md:size-10"
            />
          </Button>
        </Link>
      </div>
    </div>
  );
}
