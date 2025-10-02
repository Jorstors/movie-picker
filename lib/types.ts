// lib/types.ts
export type Event = {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  author: string;
}

export type RSVP = {
  id: string;
  author: string;
  movie: string;
}
