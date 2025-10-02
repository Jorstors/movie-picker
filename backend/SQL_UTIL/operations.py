# backend/SQL_UTIL/operations.py
create_events_table = """
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  genre VARCHAR(255),
  date TIMESTAMP NOT NULL,
  time VARCHAR(50) NOT NULL,
  location VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL
)
"""

create_rsvps_table = """
CREATE TABLE IF NOT EXISTS rsvps (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  author VARCHAR(255) NOT NULL,
  movie VARCHAR(255) NOT NULL,
  UNIQUE (event_id, author)
)
"""

insert_event = """
INSERT INTO events (title, genre, date, time, location, author)
VALUES (%s, %s, %s, %s, %s, %s) RETURNING id
"""

insert_rsvp = """
INSERT INTO rsvps (event_id, author, movie)
VALUES (%s, %s, %s) RETURNING id
ON CONFLICT (event_id, author) DO NOTHING
"""

get_events = """
    SELECT id, title, genre, date, time, location, author 
    FROM events 
    ORDER BY id DESC
    LIMIT 15
"""

get_rsvps_for_event = """
SELECT id, author, movie
FROM rsvps
WHERE event_id = %s
ORDER BY id DESC
"""
