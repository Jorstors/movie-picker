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
import { Button } from "./ui/button";
import { LoaderPinwheelIcon } from "lucide-react";
import PrizeWheel, { PrizeWheelSegment } from "./WheelComponent";
import { useMemo } from "react";
import { indexToColor } from "./SpinDialogue";
import theme from "@/lib/wheelTheme";


function SpinGenreDialogue({ genres, setSelectedGenre }: { genres: { id: string, text: string }[], setSelectedGenre: React.Dispatch<React.SetStateAction<string>> }) {

  // Fill out segments with RSVP list
  const segments: PrizeWheelSegment[] = useMemo(() => {
    if (!genres.length) return [];
    return genres
      .map((genre) => ({
        id: genre.id,
        label: genre.text,
        weight: 1,
        color: indexToColor(parseInt(genre.id))
      }) as PrizeWheelSegment);
  }, [genres]);

  const handleSpinComplete = (winner: { id: string, label: string, index: number }) => {
    console.log('Spin complete! Result:', winner);
    const movie = winner.label;
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
      <DialogContent
        className="flex flex-col items-center content-center overflow-y-scroll scrollbar-hidden"
      >
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <div className="w-full h-fit max-h-screen rounded-lg flex flex-col items-center gap-5">
          <PrizeWheel
            key={JSON.stringify(segments)}
            segments={segments}
            onSpinEnd={handleSpinComplete}
            theme={theme}
            hoverGlow={false}
            size={900}
          />
        </div>
        <DialogDescription className="text-transparent">Spin Picker For Genres</DialogDescription>
      </DialogContent>
    </Dialog>

  )
}

export default SpinGenreDialogue;
