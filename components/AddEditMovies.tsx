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
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

function AddEditMovies({ id, onSuccess }: { id?: number, onSuccess: () => void }) {
  const { user } = useContext(userContext);

  const { editing, setEditing } = useContext(editingContext);
  const [name, setName] = useState<string>("");
  const [movie, setMovie] = useState<string>("");
  const [disabled, setDisabled] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const [comboBoxOpen, setComboBoxOpen] = useState<boolean>(false);
  const [movies, setMovies] = useState<{ value: string, label: string }[]>([]);

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
      event_id: id.toString(),
      author: name,
      movie: movie,
    }
    await RSVPsCreate(rsvp);
    setDisabled(false);
    setOpen(false);
    onSuccess();
  }

  async function movieSearch(movie: string) {
    try {
      const response = await fetch("/api/movies/" + movie)
      const data = await response.json();
      const movies = data["movies"];

      return movies;
    }
    catch (error) {
      console.error("Error fetching movies:", error);
      return []; // Return an empty array in case of error
    }
  }

  function debounceMovieSearch() {
    const delay = 100; //milliseconds
    let timeoutId: NodeJS.Timeout;
    return function(movie: string) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        const movieArray = await movieSearch(movie);
        // deduplicate movieArray
        const uniqueMovies: string[] = Array.from(new Set(movieArray));
        setMovies(uniqueMovies.map((m: string) => ({ value: m, label: m })));
      }, delay);
    }
  }

  const debouncedMovieSearch = debounceMovieSearch();

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
        <PopoverContent
          onKeyDown={(e) => {
            if (e.key === "Enter" && !disabled) {
              handleSubmit();
            }
          }}>
          <div className="w-full min-h-fit p-5 flex flex-col gap-5 items-center content-center">
            <Popover open={comboBoxOpen} onOpenChange={setComboBoxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboBoxOpen}
                  className="justify-between w-full overflow-hidden text-ellipsis"
                >
                  <span className="truncate text-left">
                    {movie
                      ? movies.find((m) => m.value === movie)?.label
                      : "Select movie..."}
                  </span>
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search movie..." className="h-9"
                    onValueChange={(text) => {
                      if (text.length === 0) {
                        setMovies([]);
                        return;
                      }
                      debouncedMovieSearch(text);
                    }}
                  />
                  <CommandList>
                    <CommandEmpty>No movies found.</CommandEmpty>
                    <CommandGroup>
                      {movies.map((m) => (
                        <CommandItem
                          key={m.value}
                          value={m.value}
                          onSelect={(currentValue) => {
                            setMovie(currentValue === movie ? "" : currentValue)
                            setComboBoxOpen(false)
                          }}
                        >
                          {m.label}
                          <Check
                            className={cn(
                              "ml-auto",
                              movie === m.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Input
              type="text"
              placeholder="Name"
              value={name}
              disabled={disabled}
              onChange={(e) => setName(e.target.value)}
            />

            <Button
              variant="default"
              size="lg"
              disabled={disabled}
              className="hover:cursor-pointer w-full"
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
    </div >
  )
};

export default AddEditMovies;
