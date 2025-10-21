# backend/SQL_UTIL/operations.py
create_events_table = """
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  genre VARCHAR(255),
  date VARCHAR(255) NOT NULL,
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
  weight INT DEFAULT 1,
  UNIQUE (event_id, author)
)
"""

create_event_winners_table = """
CREATE TABLE IF NOT EXISTS event_winners (
  event_id BIGINT, 
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  rsvp_id BIGINT, 
  FOREIGN KEY (rsvp_id) REFERENCES rsvps(id) ON DELETE CASCADE,
  movie VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  radarr_sent_at TIMESTAMPTZ,
  radarr_status TEXT NOT NULL DEFAULT 'unsent',
  UNIQUE (event_id), 
  PRIMARY KEY (event_id, movie)
)
"""

insert_event = """
INSERT INTO events (title, genre, date, time, location, author)
VALUES (%s, %s, %s, %s, %s, %s) RETURNING id
"""

insert_rsvp = """
INSERT INTO rsvps (event_id, author, movie)
VALUES (%s, %s, %s)
ON CONFLICT (event_id, author) DO NOTHING
RETURNING id
"""

get_events_query = """
SELECT id, title, genre, date, time, location, author 
FROM events 
ORDER BY id DESC
LIMIT 15
"""

get_rsvps_for_event = """
SELECT event_id, id AS rsvp_id, author, movie, weight
FROM rsvps
WHERE event_id = %s
ORDER BY id DESC
"""

delete_event_query = """
DELETE FROM events
WHERE id = %s
"""

delete_rsvp_query = """
DELETE FROM rsvps
WHERE id = %s
"""

get_events_within_the_half_hour = """
SELECT *
FROM events
WHERE TO_TIMESTAMP(date || ' ' || time, 'MM/DD/YYYY HH24:MI')
BETWEEN NOW() AND (NOW() + INTERVAL '1 hour')
AND id NOT IN (SELECT event_id FROM event_winners);
"""

insert_event_winner = """
INSERT INTO event_winners (event_id, rsvp_id, movie, author)
VALUES (%s, %s, %s, %s);
"""

get_event_winner_query = """
SELECT * FROM event_winners WHERE event_id = %s
"""
