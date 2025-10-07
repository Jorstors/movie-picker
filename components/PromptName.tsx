import { userContext } from "@/app/page"
import { useContext, useState } from "react"
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "./ui/button";
import { useSearchParams } from "next/navigation";

export default function PromptName() {
  const { user, setUser } = useContext(userContext);
  const [name, setName] = useState<string>("");

  const searchParams = useSearchParams();

  // Check if URL has an event query parameter
  // If so, don't show the prompt
  if (searchParams.get("event")) {
    return <></>
  }

  // Card that dissappears once name is submitted
  return (
    user !== "" ? <></> : (
      <>
        <Card className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] z-50">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome!</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim() !== "") {
                  setUser(name.trim());
                }
              }}
            />
            <Button
              className="mt-4 w-full hover:cursor-pointer"
              onClick={() => {
                if (name.trim() !== "") {
                  setUser(name.trim());
                }
              }}
            >
              Submit
            </Button>
            <CardDescription className="my-4">Please enter your name to get started.</CardDescription>

          </CardContent>
        </Card >
        <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
      </>
    )
  );
};
