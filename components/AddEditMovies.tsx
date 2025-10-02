// components/AddEditMovies.tsx
import { Button } from "@/components/ui/button";
import { UserPlus, UserRoundPen } from "lucide-react";
function AddEditMovies() {
  return (
    <div className="w-fit h-15 flex gap-4 place-items-center">
      <Button variant="default" size="lg" className="hover:cursor-pointer">
        <UserPlus /> RSVP
      </Button>
      <Button variant="outline" size="lg" className="hover:cursor-pointer">
        <UserRoundPen /> Edit
      </Button>
    </div>
  )
};

export default AddEditMovies;
