# backend/SQL_UTIL/init_db.py
from .db import POOL
from .operations import (
    create_events_table,
    create_rsvps_table,
    create_event_winners_table,
)


def init_db():
    with POOL.connection() as conn:
        with conn.cursor() as cur:
            _ = cur.execute(create_events_table)
            _ = cur.execute(create_rsvps_table)
            _ = cur.execute(create_event_winners_table)


if __name__ == "__main__":
    init_db()
    print("[init_db] Database schema initialized successfully.")
    POOL.close()
