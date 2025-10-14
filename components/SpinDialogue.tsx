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
import { RSVP } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import PrizeWheel from "./WheelComponent";
import { PrizeWheelSegment } from "./WheelComponent";
import theme from "@/lib/wheelTheme";

type spinDialogueProps = {
  RSVPs: RSVP[];
  rsvp_winner_id: number | undefined;
}

const indexToColor = (index: number): string => {
  // Generate a color based on the index randomly
  const hue = (index * 137.508) % 360; // use golden angle approximation
  return `hsl(${hue}, 70%, 50%)`;
}

function SpinDialogue({ RSVPs, rsvp_winner_id }: spinDialogueProps) {
  const [nextClickClose, setNextClickClose] = useState<boolean>(false);
  const [wheelOpen, setWheelOpen] = useState<boolean>(false);

  // Fill out segments with RSVP list
  const segments: PrizeWheelSegment[] = useMemo(() => {
    if (!RSVPs?.length) return [];
    return RSVPs
      .filter(rsvp => rsvp.rsvp_id != null)
      .map((rsvp) => ({
        id: rsvp.rsvp_id?.toString(),
        label: rsvp.movie || "No Movie",
        weight: rsvp.weight || 1,
        color: indexToColor(rsvp.rsvp_id!),
      }) as PrizeWheelSegment);
  }, [RSVPs]);

  const rsvp_winner_id_string = rsvp_winner_id?.toString();

  const winner_in_segments: boolean = useMemo<boolean>(
    () => segments.some(segment => segment.id === rsvp_winner_id_string),
    [segments, rsvp_winner_id_string]
  );

  const spinWheelKey = useMemo(
    // Change key to reset SpinWheel when RSVPs or winner changes
    // Looks like {ids: [1,2,3], winner: 2}
    () => JSON.stringify({ id: segments, winner: rsvp_winner_id_string, winner_in_segments }),
    [segments, rsvp_winner_id_string, winner_in_segments]
  );

  useEffect(() => {
    console.log("[SpinWheel MOUNT]");
    console.log("RSVPs:", RSVPs);
    console.log("Segments:", segments);
    console.log("Winner (str):", rsvp_winner_id_string, "in_segments?", winner_in_segments);
    console.log("Winner Movie:", segments.find(segment => segment.id === rsvp_winner_id_string)?.label);;
  }, [segments, rsvp_winner_id_string, winner_in_segments, RSVPs]);

  // Ready if segments has more than 1 entry and has been filled
  const ready = segments.length > 1 && segments !== undefined;

  return (
    <>
      {!ready && (
        <Button variant="default" className="text-lg py-10 min-w-fit w-25 hover:cursor-not-allowed mt-2 mb-5" disabled>
          <LoaderPinwheelIcon className="size-10" />
        </Button>
      )}
      {
        ready && (
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
              className="flex flex-col items-center content-center"
              onClick={() => {
                if (nextClickClose) {
                  setWheelOpen(false);
                }
              }}
            >
              <DialogHeader>
                <DialogTitle></DialogTitle>
              </DialogHeader>

              <div className="min-w-fit min-h-fit flex items-center justify-center">
                <PrizeWheel
                  key={spinWheelKey}
                  segments={segments}
                  winnerId={rsvp_winner_id?.toString()}
                  onSpinEnd={() => setNextClickClose(true)}
                  disabled={nextClickClose}
                  theme={theme}
                  hoverGlow={false}
                  size={900}
                />

              </div>
              <DialogDescription className="text-transparent">Spin Picker For Movies</DialogDescription>
            </DialogContent>
          </Dialog>
        )
      }
    </>
  )
}

export default SpinDialogue;
export { indexToColor };
