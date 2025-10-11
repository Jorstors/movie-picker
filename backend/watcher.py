import os
from datetime import datetime
from time import sleep
import random
import requests

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
                        rsvp_ids = [rsvp["rsvp_id"] for rsvp in rsvps]
                        weights = [rsvp["weight"] for rsvp in rsvps]

                        chosen_rsvp_id = random.choices(rsvp_ids, weights, k=1)[0]
                        print(f"[watcher] Chosen RSVP ID: {chosen_rsvp_id}")
                        chosen_rsvp = next(
                            rsvp for rsvp in rsvps if rsvp["rsvp_id"] == chosen_rsvp_id
                        )
                        print(f"[watcher] Chosen RSVP: {chosen_rsvp}")

                        # Insert into event_winners table
                        _ = cur.execute(
                            insert_event_winner,
                            (
                                event_id,
                                chosen_rsvp["rsvp_id"],
                                chosen_rsvp["movie"],
                                chosen_rsvp["author"],
                            ),
                        )
                        print(
                            f"[watcher] Inserted event winner for event {event_id}: {chosen_rsvp['movie']} by {chosen_rsvp['author']}"
                        )

                        # ======== Send Radarr request to add the movie to the library ========

                        try:
                            # Grab Radarr URL and API key from environment variables
                            radarr_url = os.environ.get("MOVIE_PICKER_RADARR_URL")
                            radarr_api_key = os.environ.get(
                                "MOVIE_PICKER_RADARR_API_KEY"
                            )

                            if not radarr_url or not radarr_api_key:
                                print(
                                    "[watcher] Radarr URL or API key not set in environment variables"
                                )
                                print(f"[watcher] Radarr URL: {radarr_url}")
                                print(f"[watcher] Radarr API Key: {radarr_api_key}")
                                continue

                            # Build and send the Radarr lookup request for movie data
                            radarr_lookup_endpoint = f"{radarr_url}/api/v3/movie/lookup"
                            params = {
                                "term": chosen_rsvp["movie"],
                                "apikey": radarr_api_key,
                            }
                            print(
                                f"[watcher] Radarr looking up movie: {params['term']}"
                            )
                            lookup_response = requests.get(
                                radarr_lookup_endpoint,
                                params=params,
                            )

                            if not lookup_response.ok:
                                print(
                                    f"[watcher] Radarr lookup failed: {lookup_response.status_code} - {lookup_response.text}"
                                )
                                continue

                            results = lookup_response.json()
                            print(
                                f"[watcher] Radarr lookup response: {lookup_response.status_code} - {results[0] if results else 'No results found'}"
                            )

                            if not results:
                                print("[watcher] No results found in Radarr lookup")
                                continue

                            # Prioritize the first fuzzy result and its TMDB ID
                            res_movie_obj = results[0]
                            first_result_imdb_id = res_movie_obj.get("tmdbId")

                            print(
                                f"[watcher] First result TMDB ID: {first_result_imdb_id}"
                            )

                            # Get the root folder path from Radarr
                            root_folder_path = get_root_folder(
                                radarr_url, radarr_api_key
                            )

                            # Send the add movie request to Radarr with the TMDB ID
                            params = {"apikey": radarr_api_key}
                            request_body = {
                                "title": res_movie_obj.get("title"),
                                "year": res_movie_obj.get("year"),
                                "tmdbId": res_movie_obj.get("tmdbId"),
                                "qualityProfileId": 4,  # HD-1080p
                                "monitored": True,
                                "minimumAvailability": "released",
                                "isAvailable": res_movie_obj.get("isAvailable"),
                                "addOptions": {"searchForMovie": True},
                                "rootFolderPath": root_folder_path,
                            }

                            radarr_add_endpoint = f"{radarr_url}/api/v3/movie"
                            add_response = requests.post(
                                radarr_add_endpoint,
                                params=params,
                                json=request_body,
                            )

                            if not add_response.ok:
                                print(
                                    f"[watcher] Radarr add movie failed: {add_response.status_code} - {add_response.text}"
                                )
                                continue

                            print(
                                f"[watcher] Radarr add movie response: {add_response.status_code} - {add_response.text}"
                            )

                        except Exception as e:
                            print(f"[watcher] Error sending Radarr request: {e}")
                            continue

        # Sleep for a few seconds to avoid busy waiting
        sleep(10)


def get_root_folder(radarr_url: str, radarr_api_key: str):
    try:
        # Send a radarr request to add the movie to the library
        if radarr_url and radarr_api_key:
            radarr_endpoint = f"{radarr_url}/api/v3/rootfolder"
            params = {
                "apikey": radarr_api_key,
            }
            response = requests.get(
                radarr_endpoint,
                params=params,
            )

            if response.ok:
                results = response.json()
                root_folder_path = results[0].get("path")
                print(
                    f"[watcher] [get_root_folder] Root folder path: {root_folder_path}"
                )

                return root_folder_path

    except Exception as e:
        print(f"[watcher] [get_root_folder] Error sending Radarr request: {e}")


if __name__ == "__main__":
    main()
    print("[watcher] Watcher stopped")
