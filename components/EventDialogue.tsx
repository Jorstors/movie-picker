// components/EventDialogue.tsx
"use client";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import SpinDialogue from "./SpinDialogue";
import AddEditMovies from "./AddEditMovies";
import RSVPCards from "./RSVPCards";
import type { Event } from "@/app/page";
import type { RSVP } from "@/lib/types";
import RSVPsFetch from "@/lib/RSVPs";
import { useState, useEffect } from "react";

function EventDialogue({ id, title, genre, date, time, location, author }: Event) {

  const [RSVPs, setRSVPs] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch RSVP tables based on EventID 
  // to feed Spin Wheel and RSVP Cards
  useEffect(() => {
    const fetchRSVPs = async () => {
      try {
        const rsvps_data = await RSVPsFetch(id);
        setRSVPs(rsvps_data);
      }
      catch (error) {
        console.error("Error fetching RSVPs:", error);
      }
      finally {
        // Update loading state whether successful or not
        setLoading(false);
      }
    }
    fetchRSVPs();
  }, [id]);

  return (
    <Dialog>
      <DialogTrigger>
        <div className="relative flex flex-col items-start justify-start gap-2 p-5 border-ring border-2 w-[70vw] sm:w-[70vw] md:w-[45vw] min-h-40 hover:cursor-pointer bg-card hover:bg-card-foreground/10 rounded-lg shadow-xl">
          <h1 className="text-xl font-bold">{title}</h1>
          <Badge className="text-sm" variant="secondary">{genre}</Badge>
          <p className="sm:absolute top-0 right-0 m-5">{date} : {time}</p>
          <p className="sm:absolute bottom-0 left-0 m-5">{location}</p>
          <Badge variant="default" className="sm:absolute bottom-0 right-0 p-2 m-5 text-sm">{author}</Badge>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-fit min-w-fit overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="min-w-xs w-[50vw] h-[70vh] rounded-lg p-5 mx-auto flex flex-col items-center gap-5">
          <Badge variant="outline" className="w-full sm:text-lg text-center  ">
            {`${date} : ${time}`}
          </Badge>
          <SpinDialogue
            RSVPs={RSVPs}
          />
          <AddEditMovies />
          {/* RSVPs (Movie + Author Cards) */}
          {loading ? (
            <p>Loading RSVPs...</p>
          ) : (
            RSVPs.length === 0 ? (
              <p>No RSVPs found.</p>
            ) : (
              <RSVPCards
                RSVPs={RSVPs}
              />
            ))}
        </div>
        <DialogDescription className="text-transparent">RSVP viewer</DialogDescription>
      </DialogContent>
    </Dialog >
  )
}

export default EventDialogue;
