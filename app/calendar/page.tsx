import { Button } from "@/components/ui/button";
import Link from "next/link";

function CalendarPage() {
  return <div className="w-screen h-screen grid place-items-center">
    <div className="flex flex-col items-center">

      <p>This page is still being built.</p>
      <Link href="/">
        <Button variant="outline" size="lg" className="hover:cursor-pointer mt-5">Go Back Home</Button>
      </Link>

    </div>
  </div>;
}

export default CalendarPage;
