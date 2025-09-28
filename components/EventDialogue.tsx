"use client";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type EventDialogueProps = {
  title: string;
  date: string;
  time: string;
  location: string;
  author: string;
}

function EventDialogue({ title, date, time, location, author }: EventDialogueProps) {
  return (

    <Dialog>
      <DialogTrigger>
        <div className="w-[70vw] sm:w-[70vw] md:w-[45vw] h-40 bg-amber-400 hover:cursor-pointer hover:bg-amber-500 rounded-lg shadow-lg">
          <p>{title}</p>
          <p>{date}</p>
          <p>{time}</p>
          <p>{location}</p>
          <p>{author}</p>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-fit w-fit min-w-fit max-h-fit h-fit min-h-fit">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="w-[50vw] h-[70vh] bg-amber-600">{`${title}, ${date} : ${time}`}</div>
      </DialogContent>
    </Dialog>

  )
}

export default EventDialogue;
