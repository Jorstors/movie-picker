// components/RSVPCards.tsx
import { RSVP } from "@/lib/types";
import { editingContext } from "./EventDialogue";
import { useContext, useState } from "react";
import { MinusIcon, Trash2Icon } from "lucide-react";
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

function RSVPCards({ RSVPs }: { RSVPs: RSVP[] }) {

  const { editing } = useContext(editingContext);
  const [disabled, setDisabled] = useState<boolean>(false);

  return (
    <div className="w-full min-h-fit py-5 flex flex-col gap-2 items-center content-center">
      {RSVPs.length > 0 ? (
        RSVPs.map((rsvp) => (
          <div key={rsvp.id} className="w-full flex flex-row gap-2 items-center justify-between">
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
                          console.log(`Deleting RSVP with id: ${rsvp.id}`);
                          await RSVPsDelete(parseInt(rsvp.id));
                          window.location.reload();
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
              key={rsvp.id}
              className="w-full min-h-20 flex flex-row gap-2 items-center content-between text-center bg-card-foreground/10 rounded-lg p-3"
            >
              <p>
                {rsvp.movie}
              </p>
              <p className="ml-auto italic text-sm">
                {rsvp.author}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p>No RSVPs yet.</p>
      )}
    </div>
  )
};

export default RSVPCards;
