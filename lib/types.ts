// lib/types.ts
export type Event = {
  id?: number;
  title: string;
  genre?: string;
  date: string;
  time: string;
  location: string;
  author: string;
}

export type RSVP = {
  rsvp_id?: number;
  id: string;
  author: string;
  movie: string;
}
