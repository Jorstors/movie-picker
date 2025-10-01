export type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  author: string;
}

export type RSVP = {
  id: string;
  text: string;
  author: string;
  color?: string; // Optional color property for spin wheel segments
}

export type RSVPContextValue = {
  RSVPs: RSVP[],
  setRSVPs: React.Dispatch<React.SetStateAction<RSVP[]>>
}

