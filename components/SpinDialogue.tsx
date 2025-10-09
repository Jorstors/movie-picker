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
import { useState } from "react";

type spinDialogueProps = {
  RSVPs: RSVP[];
  rsvp_winner_id: number | undefined;
}

function SpinDialogue({ RSVPs, rsvp_winner_id }: spinDialogueProps) {
  const [nextClickClose, setNextClickClose] = useState<boolean>(false);
  const [wheelOpen, setWheelOpen] = useState<boolean>(false);
  // Fill out segments with RSVP list
  const segments: WheelSegment[] = [];
  if (RSVPs) {
    const hexColors: string[] = [
      "#FF5733", "#33FF57", "#3357FF", "#F333FF", "#33FFF5", "#F5FF33",
      "#FF33A8", "#A833FF", "#33FFA8", "#FFA833", "#33A8FF", "#A8FF33"
    ]
    RSVPs.forEach((rsvp, index) => {
      // Assign a color based on index
      const hexColor = hexColors[index % hexColors.length];
      // id, text(movie name), and color
      if (!rsvp.rsvp_id) return; // Skip if rsvp_id is undefined
      segments.push({
        id: rsvp.rsvp_id.toString(), text: rsvp.movie, color: hexColor, weight: rsvp.weight
      });
    });
  }

  console.log("segments: ", segments);
  console.log("rsvp_winner_id (string): ", rsvp_winner_id?.toString());
  console.log("segment_winner", segments.find(s => s.id === rsvp_winner_id?.toString()));

  const handleSpinComplete = () => {
    setNextClickClose(true);
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
          <Dialog
            open={wheelOpen}
            onOpenChange={(open) => {
              setWheelOpen(open);
              if (!open) {
                setNextClickClose(false);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button variant="default" className="text-lg py-10 min-w-fit w-25 hover:cursor-pointer mt-2 mb-5">
                <LoaderPinwheelIcon className="size-10" />
              </Button>
            </DialogTrigger>
            <DialogContent
              className="min-w-fit bg-accent"
              onClick={() => {
                if (nextClickClose) {
                  setWheelOpen(false);
                }
              }}
            >
              <DialogHeader>
                <DialogTitle></DialogTitle>
              </DialogHeader>
              <SpinWheel
                segments={segments}
                onSpinComplete={handleSpinComplete}
                disabled={nextClickClose}
                size={500}
                predefinedResult={rsvp_winner_id ? rsvp_winner_id.toString() : undefined}
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
