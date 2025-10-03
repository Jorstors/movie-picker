// components/RSVPCards.tsx
import { RSVP } from "@/lib/types";
import { editingContext } from "./EventDialogue";
import { useContext } from "react";
import { MinusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
function RSVPCards({ RSVPs }: { RSVPs: RSVP[] }) {

  const { editing } = useContext(editingContext);

  return (
    <div className="w-full min-h-fit py-5 flex flex-col gap-2 items-center content-center">
      {RSVPs.length > 0 ? (
        RSVPs.map((rsvp) => (
          <div key={rsvp.id} className="w-full flex flex-row gap-2 items-center justify-between">
            {editing && (
              <Button
                variant="destructive"
                size="icon"
                className="hover:cursor-pointer">
                <MinusIcon />
              </Button>
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
