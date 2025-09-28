from SQL_UTIL.init_db import POOL
from SQL_UTIL.operations import create_events_table, create_rsvps_table


def init_db():
    with POOL.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(create_events_table)
            cur.execute(create_rsvps_table)


if __name__ == "__main__":
    init_db()
    print("[init_db] Database schema initialized successfully.")
    POOL.close()
