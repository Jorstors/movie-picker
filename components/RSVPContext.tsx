import { createContext, useState, ReactNode } from "react";

type RSVP = {
  id: string;
  text: string;
  author?: string;
  color?: string; // Optional color property for spin wheel segments
}

type RSVPContextValue = {
  RSVPs: RSVP[],
  setRSVPs: React.Dispatch<React.SetStateAction<RSVP[]>>
}

// Context for RSVPs (Movie + Author Cards)
// ... will be fetched from the backend API
const RSVPContext = createContext<RSVPContextValue | undefined>(undefined);

export function RSVPProvider({ children }: { children: ReactNode }) {
  const segments = [
    { id: "1", text: "Inception", author: "Alice" },
    { id: "2", text: "The Matrix", author: "Bob" },
    { id: "3", text: "Interstellar", author: "Charlie" },
    { id: "4", text: "The Dark Knight", author: "Diana" },
    { id: "5", text: "Pulp Fiction", author: "Eve" },
    { id: "6", text: "Forrest Gump", author: "Frank" },
    { id: "7", text: "The Shawshank Redemption", author: "Grace" },
    { id: "8", text: "The Godfather", author: "Hank" },
    { id: "9", text: "Fight Club", author: "Ivy" },
    { id: "10", text: "The Lord of the Rings", author: "Jack" },
  ]
  const [RSVPs, setRSVPs] = useState(segments);

  return (
    <RSVPContext.Provider value={{ RSVPs, setRSVPs }}>
      {children}
    </RSVPContext.Provider>
  )
}

export { RSVPContext };
export type { RSVP };
