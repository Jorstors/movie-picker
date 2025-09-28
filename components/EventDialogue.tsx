"use client";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import SpinDialogue from "./SpinDialogue";
import AddEditMovies from "./AddEditMovies";
import RSVPCard from "./RSVPCard";
import { createContext, useState } from "react";

type EventDialogueProps = {
  title: string;
  date: string;
  time: string;
  location: string;
  author: string;
}
type RSVPContextValue = {
  RSVPs: [],
  setRSVPs: () => void
}

// Context for RSVPs (Movie + Author Cards)
// ... will be fetched from the backend API
const RSVPContext = createContext<RSVPContextValue | undefined>(undefined);

function EventDialogue({ title, date, time, location, author }: EventDialogueProps) {

  const segments = [
    { id: '1', text: 'Prize 1', color: '#ff6b6b' },
    { id: '2', text: 'Prize 2', color: '#4ecdc4' },
    { id: '3', text: 'Prize 3', color: '#1a535c' },
    { id: '4', text: 'Prize 4', color: '#ff9f1c' },
    { id: '5', text: 'Prize 5', color: '#2ec4b6' },
    { id: '6', text: 'Prize 6', color: '#e71d36' },
    { id: '7', text: 'Prize 7', color: '#3a86ff' },
    { id: '8', text: 'Prize 8', color: '#8338ec' },
    { id: '9', text: 'Prize 9', color: '#ffbe0b' },
    { id: '10', text: 'Prize 10', color: '#ff006e' },
    { id: '11', text: 'Prize 11', color: '#0f4c75' },
  ]

  const [RSVPs, setRSVPs] = useState(segments);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN((date.getTime()))) {
      return [];
    }
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return [day, month, year];
  }

  return (
    <RSVPContext.Provider value={{ RSVPs, setRSVPs }}>
      <Dialog>
        <DialogTrigger>
          <div className="relative flex flex-col items-start p-5 border-ring border-2 w-[70vw] sm:w-[70vw] md:w-[45vw] min-h-40 hover:cursor-pointer bg-card hover:bg-card-foreground/10 rounded-lg shadow-xl">
            <h1>{title}</h1>
            <p className="absolute top-0 right-0 m-5">{formatDate(date).length === 0 ? date : formatDate(date).join("/")} : {time}</p>
            <p className="absolute bottom-0 left-0 m-5">{location}</p>
            <Badge variant="default" className="absolute bottom-0 right-0 p-2 m-5">{author}</Badge>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-fit w-fit min-w-fit overflow-y-scroll">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="w-[50vw] h-[70vh] rounded-lg p-5 flex flex-col items-center gap-5">
            <Badge variant="outline" className="w-full text-lg text-center  ">
              {`${date} : ${time}`}
            </Badge>
            <SpinDialogue />
            <AddEditMovies />
            {/* RSVPs (Movie + Author Cards) */}
            <RSVPCard />
          </div>
        </DialogContent>
      </Dialog>
    </RSVPContext.Provider>
  )
}

export default EventDialogue;
export { RSVPContext };
