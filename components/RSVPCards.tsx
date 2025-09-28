import { useContext } from "react";
import { RSVPContext } from "./EventDialogue";

function RSVPCards() {
  const { RSVPs, setRSVPs } = useContext(RSVPContext);

  return (
    <div className="w-full min-h-full py-5 flex flex-col gap-2 items-center content-center">
      {RSVPs.length > 0 ? (
        RSVPs.map((rsvp) => (
          <div
            key={rsvp.id}
            className="w-full min-h-20 flex flex-row gap-2 items-center content-between text-center bg-card-foreground/10 rounded-lg p-3"
          >
            <p>
              {rsvp.text}
            </p>
            <p className="ml-auto italic text-sm">
              {rsvp.author}
            </p>
          </div>
        ))
      ) : (
        <p>No RSVPs yet.</p>
      )}
    </div>
  )
};

export default RSVPCards;
