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
import RSVPCards from "./RSVPCards";
import { RSVPProvider } from "./RSVPContext";

type EventDialogueProps = {
  title: string;
  date: string;
  time: string;
  location: string;
  author: string;
}


function EventDialogue({ title, date, time, location, author }: EventDialogueProps) {

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
    <RSVPProvider>
      <Dialog>
        <DialogTrigger>
          <div className="relative flex flex-col items-start justify-start gap-2 p-5 border-ring border-2 w-[70vw] sm:w-[70vw] md:w-[45vw] min-h-40 hover:cursor-pointer bg-card hover:bg-card-foreground/10 rounded-lg shadow-xl">
            <h1 className="text-lg font-bold">{title}</h1>
            <p className="sm:absolute top-0 right-0 m-5">{formatDate(date).length === 0 ? date : formatDate(date).join("/")} : {time}</p>
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
            <SpinDialogue />
            <AddEditMovies />
            {/* RSVPs (Movie + Author Cards) */}
            <RSVPCards />
          </div>
        </DialogContent>
      </Dialog>
    </RSVPProvider>
  )
}

export default EventDialogue;
