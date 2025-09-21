CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mc_name VARCHAR(255),
  telegram_id BIGINT UNIQUE,
  telegram_username VARCHAR(255),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles(name) VALUES
('user'), ('youtuber'), ('tiktoker'), ('beta'), ('owner');

CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id INT REFERENCES roles(id)
);

CREATE TABLE pending_links (
  token_hash VARCHAR(128) PRIMARY KEY,
  token_short VARCHAR(16),
  mc_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP NOT NULL,
  claimed BOOLEAN DEFAULT FALSE,
  claimed_by_telegram_id BIGINT,
  claimed_at TIMESTAMP
);
