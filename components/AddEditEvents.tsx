// components/AddEditEvents.tsx
import { Button } from "@/components/ui/button";
import { TicketPlus } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import SpinGenreDialogue from "./SpinGenreDialogue";
import { TimePicker } from "@/components/TimePicker";
import { useContext, useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Event } from "@/lib/types";
import { EventCreate } from "@/lib/Events";
import { userContext } from "@/app/page";


function AddEdit({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useContext(userContext);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedGenre, setSelectedGenre] = useState<string>("None");
  const [date, setDate] = useState<Date>(new Date());
  const [dateString, setDateString] = useState<string>("");
  const [time, setTime] = useState<string>("12:00");
  const [location, setLocation] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [disabled, setDisabled] = useState<boolean>(false);

  console.log("User from Context: ", user);
  console.log("Author State: ", author);

  // Sync author state with user context
  useEffect(() => {
    setAuthor(user);
  }, [user]);

  useEffect(() => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const formattedDate = `${month}/${day}/${year}`;
    setDateString(formattedDate);
    console.log("Reformatted Date to Date String: ", formattedDate);
  }, [date]);

  const handleCreateEvent = async () => {
    console.log("Create Event Clicked");
    console.log("Selected Genre: ", selectedGenre);
    console.log("Selected Date: ", dateString);
    console.log("Selected Time: ", time);
    console.log("Location: ", location);
    console.log("Title: ", title);

    // Basic form validation
    if (selectedGenre === "None" || !dateString || !time || !location || !title || !author) {
      alert("Please fill out all fields before creating an event.");
      return;
    }

    setDisabled(true);

    // API call to create event
    const event: Event = {
      title: title,
      genre: selectedGenre,
      date: dateString,
      time: time,
      location: location,
      author: author
    }
    await EventCreate(event)
    // Reset form
    setSelectedGenre("None");
    setDate(new Date());
    setTime("12:00");
    setLocation("");
    setTitle("");
    setAuthor(user);
    setDisabled(false);

    // Notify parent to refresh event list
    setOpen(false);
    onSuccess();
  }



  const genres: { id: string, text: string }[] = [
    { id: "1", text: "Action" },
    { id: "2", text: "Comedy" },
    { id: "3", text: "Drama" },
    { id: "4", text: "Horror" },
    { id: "5", text: "Romance" },
    { id: "6", text: "Sci-Fi" },
    { id: "7", text: "Thriller" },
    { id: "8", text: "Fantasy" }
  ]
  return (
    <div className="w-full h-15 flex gap-4 items-center content-center">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild >
          <Button variant="outline" size="lg" className="hover:cursor-pointer">
            <TicketPlus /> Add Event
          </Button>
        </DialogTrigger>
        <DialogContent className="min-w-md flex flex-col items-center content-center p-15">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add New Event</DialogTitle>
          </DialogHeader>
          <p className="mb-2 underline-offset-2 underline">Spin to Select Genre</p>
          <SpinGenreDialogue
            genres={genres}
            setSelectedGenre={setSelectedGenre}
          />
          <p className="italic">{selectedGenre}</p>
          <TimePicker
            date={date}
            setDate={setDate}
            setTime={setTime}
          />
          <Input
            placeholder="Event Location"
            className="w-full mt-2"
            value={location}
            disabled={disabled}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Input
            placeholder="Event Title"
            className="w-full"
            value={title}
            disabled={disabled}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="What's your name?"
            className="w-full mb-5"
            value={author}
            disabled={disabled}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <Button
            className="w-full hover:cursor-pointer"
            onClick={handleCreateEvent}
            disabled={disabled}
          >
            Create Event
          </Button>
          <DialogDescription className="text-transparent">Add Event</DialogDescription>
        </DialogContent>
      </Dialog>
    </div >
  )
};

export default AddEdit;
