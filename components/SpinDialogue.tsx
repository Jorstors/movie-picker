
"use client";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SpinWheel } from "react-prize-wheel";
import { Button } from "./ui/button";
import { useContext } from "react";
import { RSVPContext } from "./EventDialogue";
import { LoaderPinwheelIcon } from "lucide-react";


function SpinDialogue() {
  // Define the segments for the spin wheel
  const { RSVPs, setRSVPs } = useContext(RSVPContext);

  // Fill out segments with RSVP list
  let segments = []
  if (RSVPs) {
    RSVPs.forEach((rsvp, index) => {
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

  if (segments.length === 0) {
    segments = [
      { id: '1', text: 'No RSVPs Yet', color: '#d3d3d3' },
      { id: '2', text: 'No RSVPs Yet', color: '#a9a9a9' },
    ]
  }

  const handleSpinComplete = () => {
    console.log('Spin complete!');
  }

  return (

    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="text-lg py-10 min-w-fit w-25 hover:cursor-pointer mt-2 mb-5">
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
          size={700}
          showSpinButton={false}
        />
      </DialogContent>
    </Dialog>

  )
}

export default SpinDialogue;
