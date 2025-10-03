// components/AddEditMovies.tsx
import { Button } from "@/components/ui/button";
import { UserPlus, UserRoundPen } from "lucide-react";
import { useContext } from "react";
import { editingContext } from "./EventDialogue";
function AddEditMovies() {

  const { editing, setEditing } = useContext(editingContext);

  return (
    <div className="w-fit h-15 flex gap-4 place-items-center">
      <Button variant="default" size="lg" className="hover:cursor-pointer">
        <UserPlus /> RSVP
      </Button>
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
