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

type EventDialogueProps = {
  title: string;
  date: string;
  time: string;
  location: string;
  author: string;
}

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

function EventDialogue({ title, date, time, location, author }: EventDialogueProps) {
  return (

    <Dialog>
      <DialogTrigger>
        <div className="relative flex flex-col items-start p-5 border-ring border-2 w-[70vw] sm:w-[70vw] md:w-[45vw] min-h-40 hover:cursor-pointer bg-card hover:bg-card-foreground/10 rounded-lg shadow-xl">
          <h1>{title}</h1>
          <p className="absolute top-0 right-0 m-5">{formatDate(date).length === 0 ? date : formatDate(date).join("/")} : {time}</p>
          <p className="absolute bottom-0 left-0 m-5">{location}</p>
          <Badge variant="default" className="absolute bottom-0 right-0 p-2 m-5">{author}</Badge>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-fit w-fit min-w-fit max-h-fit h-fit min-h-fit">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="w-[50vw] h-[70vh] bg-neutral-300 rounded-lg p-5">{`${title}, ${date} : ${time}`}</div>
      </DialogContent>
    </Dialog>

  )
}

export default EventDialogue;
