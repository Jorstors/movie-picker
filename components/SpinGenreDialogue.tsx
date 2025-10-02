// components/SpinDialogue.tsx

"use client";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SpinWheel } from "react-prize-wheel";
import { Button } from "./ui/button";
import type { SpinResult, WheelSegment } from "react-prize-wheel";
import { LoaderPinwheelIcon } from "lucide-react";


function SpinGenreDialogue({ genres, setSelectedGenre }: { genres: { id: string, text: string }[], setSelectedGenre: React.Dispatch<React.SetStateAction<string>> }) {

  // Fill out segments with RSVP list
  let segments: WheelSegment[] = [];
  if (genres) {
    genres.forEach((rsvp) => {
      // Assign a color based on index (hex colors)
      const randomColor = Math.floor(Math.random() * 16777215);
      let hexColor = randomColor.toString(16);
      hexColor = '#' + hexColor.padStart(6, '0');
      // id, text(movie name), and color
      segments.push({
        id: rsvp.id, text: rsvp.text, color: hexColor
      });
    });
  }

  // If no RSVPs, show placeholder segments
  if (segments.length === 0) {
    segments = [
      { id: '1', text: 'No RSVPs Yet', color: '#d3d3d3' },
      { id: '2', text: 'No RSVPs Yet', color: '#a9a9a9' },
    ]
  }

  const handleSpinComplete = (result: SpinResult) => {
    console.log('Spin complete! Result:', result);
    const movie = result.segment.text;
    console.log("Selected Genre: ", movie);
    setSelectedGenre(movie);
  }

  return (

    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="text-lg p-10 min-w-fit w-25 hover:cursor-pointer">
          <LoaderPinwheelIcon className="size-10" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-transparent border-transparent shadow-none min-w-fit">
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <SpinWheel
          segments={segments}
          onSpinComplete={handleSpinComplete}
          size={200}
          showSpinButton={false}
        />
        <DialogDescription className="text-transparent">Spin Picker For Genres</DialogDescription>
      </DialogContent>
    </Dialog>

  )
}

export default SpinGenreDialogue;
