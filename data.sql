DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tradesmen CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS chat CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TYPE IF EXISTS status_enum CASCADE;

CREATE TABLE users (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone BIGINT NOT NULL UNIQUE,
  street_address TEXT NOT NULL,
  address_city TEXT NOT NULL,
  address_zip TEXT NOT NULL,
  address_country TEXT NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE tradesmen (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone BIGINT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  rating INTEGER,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TYPE status_enum AS ENUM ('auction', 'progressing', 'completed', 'cancelled');

CREATE TABLE projects (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
  description TEXT NOT NULL,
  street_address TEXT NOT NULL,
  address_city TEXT NOT NULL,
  address_zip TEXT NOT NULL,
  address_country TEXT NOT NULL,  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  price NUMERIC,
  tradesmen_id INTEGER REFERENCES tradesmen ON DELETE CASCADE,
  status status_enum DEFAULT 'auction',
  completed_at TIMESTAMP,
  issues TEXT
);

CREATE TABLE photos (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  project_id INTEGER NOT NULL,
  photo_link TEXT NOT NULL,
  description TEXT NOT NULL, 
  user_id INTEGER NOT NULL,
  after BOOLEAN NOT NULL DEFAULT FALSE  --if false photo is before if true photo is after
);

CREATE TABLE chat (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  project_id INTEGER NOT NULL,
  user_id INTEGER,
  tradesmen_id INTEGER,
  comment TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE reviews (
  user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
  tradesmen_id INTEGER NOT NULL REFERENCES tradesmen ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES projects ON DELETE CASCADE,
  review_comment TEXT,
  review_rating INTEGER NOT NULL,
  PRIMARY KEY(user_id, project_id),
  CONSTRAINT valid_rating CHECK (review_rating > 0 AND review_rating < 11)
);

ALTER TABLE photos ADD CONSTRAINT fk_projects FOREIGN KEY (project_id) REFERENCES projects ON DELETE CASCADE;

ALTER TABLE chat ADD CONSTRAINT fk_users FOREIGN KEY (user_id) REFERENCES users ON DELETE CASCADE;
ALTER TABLE chat ADD CONSTRAINT fk_tradesmen FOREIGN KEY (tradesmen_id) REFERENCES tradesmen ON DELETE CASCADE;
ALTER TABLE chat ADD CONSTRAINT fk_projects FOREIGN KEY (project_id) REFERENCES projects ON DELETE CASCADE;
