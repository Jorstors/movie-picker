import { userContext } from "@/app/page"
import { Suspense, useContext, useState } from "react"
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
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PromptNameInner />
    </Suspense>
  )
}

function PromptNameInner() {
  const { user, setUser } = useContext(userContext);
  const [name, setName] = useState<string>("");

  const searchParams = useSearchParams();

  // Check if URL has an event query parameter
  // If so, don't show the prompt
  if (searchParams.get("event")) {
    return <></>;
  }

  // Card that dissappears once name is submitted
  return (
    user !== "" ? <></> : (
      <>
        <Card className="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg">
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
