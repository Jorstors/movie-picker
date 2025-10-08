import os
from datetime import datetime
from time import sleep
import random

# psycopg using dict row factory
from .SQL_UTIL.db import POOL
from .SQL_UTIL.operations import (
    get_events_within_the_hour,
    get_rsvps_for_event,
    insert_event_winner,
)


def main():
    print("[watcher] Watcher started")
    next_minute = datetime.now().minute
    # Only trigger the watcher at the start of each minute
    while True:
        this_minute = datetime.now().minute
        if this_minute != next_minute:
            continue
        # Increment the next minute
        next_minute = (this_minute + 1) % 60
        this_datetime = datetime.now()
        print(f"[watcher] Triggering watcher at {this_datetime}")
        date_string = ""
        format_string = "%m/%d/%Y"

        # Select events within an hour of now, that are not in the event_winners table
        # Then, pick a winner for each event, and insert into event_winners table
        # Finally, send a radarr request to add the movie to the library

        with POOL.connection() as conn:
            with conn.cursor() as cur:
                _ = cur.execute(get_events_within_the_hour)
                events = cur.fetchall()
                print(
                    f"[watcher] Found {len(events)} events within the hour that need processing"
                )
                for event in events:
                    print(f"[watcher] Event found within the hour: {event}")
                    # Need to pick an event winner
                    # First, get the RSVPs for the event
                    event_id = event["id"]
                    _ = cur.execute(get_rsvps_for_event, (event_id,))
                    rsvps = cur.fetchall()
                    print(f"[watcher] Found {len(rsvps)} RSVPs for event {event_id}")
                    if rsvps:
                        # Pick a winner based on weights
                        import random

                        rsvp_ids = [rsvp["id"] for rsvp in rsvps]
                        weights = [rsvp["weight"] for rsvp in rsvps]

                        chosen_rsvp_id = random.choices(rsvp_ids, weights, k=1)[0]
                        print(f"[watcher] Chosen RSVP ID: {chosen_rsvp_id}")
                        chosen_rsvp = next(
                            rsvp for rsvp in rsvps if rsvp["id"] == chosen_rsvp_id
                        )
                        print(f"[watcher] Chosen RSVP: {chosen_rsvp}")

                        # Insert into event_winners table
                        _ = cur.execute(
                            insert_event_winner,
                            (event_id, chosen_rsvp["movie"], chosen_rsvp["author"]),
                        )
                        print(
                            f"[watcher] Inserted event winner for event {event_id}: {chosen_rsvp['movie']} by {chosen_rsvp['author']}"
                        )

                        # Send a radarr request to add the movie to the library
                        radarr_url = os.environ.get("MOVIE_PICKER_RADARR_URL")
                        radarr_api_key = os.environ.get("MOVIE_PICKER_RADARR_API_KEY")

        # Sleep for a few seconds to avoid busy waiting
        sleep(10)


if __name__ == "__main__":
    main()
    print("[watcher] Watcher stopped")
