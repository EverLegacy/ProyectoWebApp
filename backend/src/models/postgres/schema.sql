
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stores (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(100) NOT NULL,
  location TEXT,
  category VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS loyalty_cards (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER REFERENCES users(id) ON DELETE CASCADE,
  card_number    VARCHAR(20) UNIQUE NOT NULL,
  points_balance INTEGER DEFAULT 0,
  tier           VARCHAR(20) DEFAULT 'bronze',
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id            SERIAL PRIMARY KEY,
  card_id       INTEGER REFERENCES loyalty_cards(id),
  store_id      INTEGER REFERENCES stores(id),
  amount        NUMERIC(10,2) NOT NULL,
  points_earned INTEGER NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rewards (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  stock       INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS redemptions (
  id          SERIAL PRIMARY KEY,
  card_id     INTEGER REFERENCES loyalty_cards(id),
  reward_id   INTEGER REFERENCES rewards(id),
  redeemed_at TIMESTAMP DEFAULT NOW(),
  status      VARCHAR(20) DEFAULT 'pending'
);
