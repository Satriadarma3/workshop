-- Skema PostgreSQL sesuai ERD Langganku.
-- Untuk MySQL: ganti UUID dengan CHAR(36), gen_random_uuid() dengan UUID(), TIMESTAMPTZ dengan TIMESTAMP.

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- untuk gen_random_uuid()

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- email unik tanpa membedakan huruf besar-kecil
CREATE UNIQUE INDEX users_email_key ON users (lower(email));

CREATE TABLE categories (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50)  NOT NULL DEFAULT 'tag'
);
CREATE UNIQUE INDEX categories_name_key ON categories (lower(name));

CREATE TABLE subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  category_id       UUID REFERENCES categories (id) ON DELETE SET NULL, -- opsional
  service_name      VARCHAR(150) NOT NULL,
  price             DECIMAL(12, 2) NOT NULL CHECK (price > 0),
  billing_cycle     VARCHAR(10) NOT NULL CHECK (billing_cycle IN ('MONTHLY', 'YEARLY')),
  next_billing_date DATE NOT NULL,
  status            VARCHAR(10) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'CANCELLED')),
  notes             TEXT NOT NULL DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX subscriptions_user_idx ON subscriptions (user_id, status, next_billing_date);
CREATE INDEX subscriptions_category_idx ON subscriptions (category_id);

-- Data awal kategori (sama dengan yang dipakai mock di frontend)
INSERT INTO categories (name, icon) VALUES
  ('Hiburan', 'film'),
  ('Musik', 'music'),
  ('Penyimpanan', 'cloud'),
  ('Pengembangan', 'code'),
  ('Belajar', 'book'),
  ('Game', 'gamepad');
