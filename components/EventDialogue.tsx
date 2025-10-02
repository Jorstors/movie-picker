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
import { Button } from "./ui/button";
import { Trash2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { EventDelete } from "@/lib/Events";

function formatTime(time: string): string {
  // Input: "14:30" -> Output: "2:30 PM"
  const hour = parseInt(time.split(":")[0])
  const minute = time.split(":")[1]

  if (hour === 0) {
    return `12:${minute} AM`
  }
  else if (hour === 12) {
    return `12:${minute} PM`
  }

  return hour >= 12 ? `${hour - 12}:${minute} PM` : `${hour}:${minute} AM`
}

function EventDialogue({ id, title, genre, date, time, location, author }: Event) {

  const [open, setOpen] = useState(false);
  const [RSVPs, setRSVPs] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch RSVP tables based on EventID 
  // to feed Spin Wheel and RSVP Cards
  useEffect(() => {
    if (!open) return; // Only fetch when dialog is opened
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
  }, [id, open]);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger>
        <div className="relative flex flex-col items-start justify-start gap-2 p-5 border-ring border-2 w-[70vw] sm:w-[70vw] md:w-[45vw] min-h-40 hover:cursor-pointer bg-card hover:bg-card-foreground/10 rounded-lg shadow-xl">
          <h1 className="text-xl font-bold">{title}</h1>
          <Badge className="text-sm" variant="secondary">{genre}</Badge>
          <p className="sm:absolute top-0 right-0 m-5">{date} : {formatTime(time)}</p>
          <p className="sm:absolute bottom-0 left-0 m-5">{location}</p>
          <Badge variant="default" className="sm:absolute bottom-0 right-0 p-2 m-5 text-sm">{author}</Badge>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-fit min-w-fit overflow-y-scroll scrollbar-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="min-w-xs w-[50vw] h-[70vh] rounded-lg p-5 mx-auto flex flex-col items-center gap-5">
          <Badge variant="outline" className="w-full sm:text-lg text-center  ">
            {`${date} : ${formatTime(time)}`}
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className=" w-fit p-5 hover:cursor-pointer mx-auto"
              >
                <Trash2Icon />
                Delete
              </Button>

            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the event and remove all associated RSVPs.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="hover:cursor-pointer">Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    variant="destructive"
                    className="hover:cursor-pointer bg-destructive hover:bg-destructive"
                    onClick={async () => {
                      await EventDelete(id);
                    }}
                  >
                    <Trash2Icon />
                    Delete
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <DialogDescription className="text-transparent">RSVP viewer</DialogDescription>
        </div>

      </DialogContent>
    </Dialog >
  )
}

export default EventDialogue;
