// components/AddEditMovies.tsx
import { Button } from "@/components/ui/button";
import { UserPlus, UserRoundPen } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { editingContext } from "./EventDialogue";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Input } from "./ui/input";
import { RSVPsCreate } from "@/lib/RSVPs";
import { RSVP } from "@/lib/types";
import { userContext } from "@/app/page";

function AddEditMovies({ id, onSuccess }: { id?: number, onSuccess: () => void }) {
  const { user } = useContext(userContext);

  const { editing, setEditing } = useContext(editingContext);
  const [name, setName] = useState<string>("");
  const [movie, setMovie] = useState<string>("");
  const [disabled, setDisabled] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  // Sync name state with user context
  useEffect(() => {
    setName(user);
  }, [user]);

  const handleSubmit = async () => {
    if (!name || !movie) {
      return;
    }
    setDisabled(true);
    console.log("Submitting RSVP: ", { name, movie });
    if (!id) {
      console.error("Event ID is undefined. Cannot create RSVP.");
      setDisabled(false);
      return;
    }
    const rsvp: RSVP = {
      id: id.toString(),
      author: name,
      movie: movie,
    }
    await RSVPsCreate(rsvp);
    setDisabled(false);
    setOpen(false);
    onSuccess();
  }

  return (
    <div className="w-fit h-15 flex gap-4 place-items-center">
      <Popover
        open={open}
        onOpenChange={setOpen}
      >
        <PopoverTrigger asChild>
          <Button variant="default" size="lg" className="hover:cursor-pointer">
            <UserPlus /> RSVP
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="w-full min-h-fit p-5 flex flex-col gap-5 items-center content-center">
            <Input
              type="text"
              placeholder="Movie"
              value={movie}
              disabled={disabled}
              onChange={(e) => setMovie(e.target.value)}
              className="w-40" />
            <Input
              type="text"
              placeholder="Name"
              value={name}
              disabled={disabled}
              onChange={(e) => setName(e.target.value)}
              className="w-40" />

            <Button
              variant="default"
              size="lg"
              disabled={disabled}
              className="hover:cursor-pointer"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <Button
        variant="outline"
        size="lg"
        className="hover:cursor-pointer"
        onClick={() => setEditing(!editing)}
      >
        <UserRoundPen /> Edit
      </Button>
    </div>
  )
};

export default AddEditMovies;
