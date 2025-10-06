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
import type { WheelSegment } from "react-prize-wheel";
import { LoaderPinwheelIcon } from "lucide-react";
import { RSVP } from "@/lib/types";


function SpinDialogue({ RSVPs }: { RSVPs: RSVP[] }) {

  // Fill out segments with RSVP list
  const segments: WheelSegment[] = [];
  if (RSVPs) {
    RSVPs.forEach((rsvp) => {
      // Assign a color based on index (hex colors)
      const randomColor = Math.floor(Math.random() * 16777215);
      let hexColor = randomColor.toString(16);
      hexColor = '#' + hexColor.padStart(6, '0');
      // id, text(movie name), and color
      if (!rsvp.rsvp_id) return; // Skip if rsvp_id is undefined
      segments.push({
        id: rsvp.rsvp_id.toString(), text: rsvp.movie, color: hexColor
      });
    });
  }

  const handleSpinComplete = () => {
    console.log('Spin complete!');
  }

  return (
    <>
      {segments.length <= 1 && (
        <Button variant="default" className="text-lg py-10 min-w-fit w-25 hover:cursor-not-allowed mt-2 mb-5" disabled>
          <LoaderPinwheelIcon className="size-10" />
        </Button>
      )}
      {
        segments.length > 1 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" className="text-lg py-10 min-w-fit w-25 hover:cursor-pointer mt-2 mb-5">
                <LoaderPinwheelIcon className="size-10" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-transparent border-transparent shadow-none min-w-fit text-transparent">
              <DialogHeader>
                <DialogTitle></DialogTitle>
              </DialogHeader>
              <SpinWheel
                segments={segments}
                onSpinComplete={handleSpinComplete}
                size={500}
                showSpinButton={false}
              />
              <DialogDescription className="text-transparent">Spin Picker For Movies</DialogDescription>
            </DialogContent>
          </Dialog>
        )
      }
    </>
  )
}

export default SpinDialogue;
