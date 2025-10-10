// components/RSVPCards.tsx
import { RSVP } from "@/lib/types";
import { editingContext } from "./EventDialogue";
import { useContext, useState } from "react";
import { MinusIcon, PlusIcon, Trash2Icon, WeightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { RSVPsDelete } from "@/lib/RSVPs";

type RSVPCardsProps = {
  RSVPs: RSVP[];
  onSuccess: () => void;
}

function RSVPCards({ RSVPs, onSuccess }: RSVPCardsProps) {

  const { editing } = useContext(editingContext);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [weightDisabled, setWeightDisabled] = useState<boolean>(false);

  const updateWeight = async (rsvp_id: number, weight: number, increment: boolean) => {
    if (weight <= 1 && !increment) return; // Prevent weight from going below 1
    setWeightDisabled(true);
    const newWeight = increment ? weight + 1 : weight - 1;

    const updatedRSVPInfo = {
      weight: newWeight
    }
    try {
      // Patch request to update weight
      await fetch(`/api/rsvps/${rsvp_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedRSVPInfo)
      })
    }
    catch (error) {
      console.error("Error updating weight:", error);
    }
    finally {
      setWeightDisabled(false);
      onSuccess();
    }
  }

  return (
    <div className="w-full min-h-fit py-5 flex flex-col gap-2 items-center content-center">
      {RSVPs.length > 0 ? (
        RSVPs.map((rsvp) => (
          <div key={rsvp.rsvp_id} className="w-full flex flex-row gap-2 items-center justify-between">
            {editing && (

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="hover:cursor-pointer"
                    disabled={disabled}>
                    <MinusIcon />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the RSVP.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="hover:cursor-pointer">Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button
                        variant="destructive"
                        className="hover:cursor-pointer bg-destructive hover:bg-destructive"
                        disabled={disabled}
                        onClick={async () => {
                          setDisabled(true);
                          console.log(`Deleting RSVP with id: ${rsvp.rsvp_id}`);
                          await RSVPsDelete(parseInt(rsvp.rsvp_id?.toString() || "0"));
                          setDisabled(false);
                          onSuccess();
                        }}
                      >
                        <Trash2Icon />
                        Delete
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

            )}
            <div
              key={rsvp.event_id}
              className="w-full min-h-20 flex flex-row gap-2 items-center content-between text-center bg-card-foreground/10 rounded-lg p-3"
            >
              <p>
                {rsvp.movie}
              </p>
              <p className="ml-auto italic text-sm">
                {rsvp.author}
              </p>
            </div>
            {editing && (
              <>
                <div className="w-fit h-full flex flex-col gap-2 items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:cursor-pointer"
                    disabled={weightDisabled}
                    onClick={() => updateWeight(rsvp.rsvp_id || 0, rsvp.weight || 1, true)}
                  >
                    <PlusIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:cursor-pointer"
                    disabled={weightDisabled}
                    onClick={() => updateWeight(rsvp.rsvp_id || 0, rsvp.weight || 1, false)}
                  >
                    <MinusIcon />
                  </Button>
                </div>
                <div className="w-fit h-full flex gap-3 items-center justify-center">
                  {/* Weight Count */}
                  {rsvp.weight || 1}
                  <WeightIcon size={16} />
                </div>
              </>
            )}
          </div>
        ))
      ) : (
        <p>No RSVPs yet.</p>
      )}
    </div>
  )
};

export default RSVPCards;
