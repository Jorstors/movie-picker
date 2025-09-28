import { Button } from "@/components/ui/button";
import { TicketPlus, TicketMinus } from "lucide-react";
function AddEdit() {
  return (
    <div className="w-full h-15 flex gap-4 items-center content-center bg-sky-200">
      <Button variant="outline" size="lg" className="hover:cursor-pointer">
        <TicketPlus /> Add Event
      </Button>
      <Button variant="outline" size="lg" className="hover:cursor-pointer">
        <TicketMinus /> Remove Event
      </Button>
    </div>
  )
};

export default AddEdit;
