CREATE TABLE IF NOT EXISTS areas(
  id INTEGER PRIMARY KEY, name TEXT, description TEXT, icon TEXT
);
CREATE TABLE IF NOT EXISTS listings(
  id INTEGER PRIMARY KEY, area_id INTEGER, type TEXT, title TEXT, summary TEXT,
  date_start TEXT, date_end TEXT, venue TEXT, price TEXT, contact TEXT,
  featured INTEGER DEFAULT 0,
  FOREIGN KEY(area_id) REFERENCES areas(id)
);
CREATE TABLE IF NOT EXISTS faqs(
  id INTEGER PRIMARY KEY, question TEXT, answer TEXT
);
CREATE TABLE IF NOT EXISTS contacts(
  id INTEGER PRIMARY KEY, name TEXT, email TEXT, subject TEXT, message TEXT, created_at TEXT
);

INSERT INTO areas(name,description,icon) VALUES
('Sports','Clubs and activities','sports'),
('Health','Services and classes','health'),
('Education','Courses and workshops','education'),
('Arts & Culture','Events and groups','arts');

INSERT INTO listings(area_id,type,title,summary,date_start,date_end,venue,price,contact,featured) VALUES
(1,'event','Local Fair','Community fair for all ages','2025-10-15','2025-10-15','Hyde Park','Free Entrance','info@community.org',1);

INSERT INTO faqs(question,answer) VALUES
('How do I join a club?','Open the area page and follow the contact details.');
