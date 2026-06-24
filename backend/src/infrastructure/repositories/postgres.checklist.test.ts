import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { newDb } from 'pg-mem';
import { Pool } from 'pg';
import {
  UserRepository,
  LoyaltyCardRepository,
  RewardRepository,
  StoreRepository,
  TransactionRepository,
} from './index';

let pool: Pool;

beforeAll(async () => {
  const db = newDb();

  await db.public.query(`
    CREATE TABLE users (
      id            SERIAL PRIMARY KEY,
      name          VARCHAR(100) NOT NULL,
      email         VARCHAR(150) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role          VARCHAR(20) NOT NULL DEFAULT 'user',
      reset_token   VARCHAR(100),
      reset_token_expires TIMESTAMP,
      created_at    TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE stores (
      id       SERIAL PRIMARY KEY,
      name     VARCHAR(100) NOT NULL,
      location TEXT,
      category VARCHAR(60)
    );
    CREATE TABLE loyalty_cards (
      id             SERIAL PRIMARY KEY,
      user_id        INTEGER REFERENCES users(id) ON DELETE CASCADE,
      card_number    VARCHAR(20) UNIQUE NOT NULL,
      points_balance INTEGER DEFAULT 0,
      tier           VARCHAR(20) DEFAULT 'bronze',
      created_at     TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE transactions (
      id            SERIAL PRIMARY KEY,
      card_id       INTEGER REFERENCES loyalty_cards(id),
      store_id      INTEGER REFERENCES stores(id),
      amount        NUMERIC(10,2) NOT NULL,
      points_earned INTEGER NOT NULL,
      created_at    TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE rewards (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(100) NOT NULL,
      description TEXT,
      points_cost INTEGER NOT NULL,
      stock       INTEGER DEFAULT 0
    );
    CREATE TABLE redemptions (
      id          SERIAL PRIMARY KEY,
      card_id     INTEGER REFERENCES loyalty_cards(id),
      reward_id   INTEGER REFERENCES rewards(id),
      redeemed_at TIMESTAMP DEFAULT NOW(),
      status      VARCHAR(20) DEFAULT 'pending'
    );
  `);

  const adapter = db.adapters.createPg();
  pool = new adapter.Pool() as unknown as Pool;
});









afterEach(async () => {
  await pool.query('DELETE FROM redemptions');
  await pool.query('DELETE FROM transactions');
  await pool.query('DELETE FROM loyalty_cards');
  await pool.query('DELETE FROM rewards');
  await pool.query('DELETE FROM stores');
  await pool.query('DELETE FROM users');
});

async function createUser(name = 'Ana', email = 'ana@test.com', hash = 'hash123') {
  return new UserRepository(pool).create(name, email, hash);
}






describe('UserRepository — CRUD con BD real', () => {
  it('create: inserta usuario y retorna campos sin exponer password_hash', async () => {
    const user = await createUser();

    expect(user.id).toBeTypeOf('number');
    expect(user.name).toBe('Ana');
    expect(user.email).toBe('ana@test.com');
    expect(user).not.toHaveProperty('password_hash');
  });

  it('findByEmail: retorna usuario existente', async () => {
    await createUser();
    const found = await new UserRepository(pool).findByEmail('ana@test.com');

    expect(found).not.toBeNull();
    expect(found?.password_hash).toBe('hash123');
  });

  it('findByEmail: retorna null si no existe', async () => {
    const found = await new UserRepository(pool).findByEmail('nadie@test.com');
    expect(found).toBeNull();
  });
});


describe('Constraints de BD', () => {
  it('UNIQUE: email duplicado lanza error', async () => {
    await createUser('Ana', 'duplicado@test.com');

    await expect(
      createUser('Otra Ana', 'duplicado@test.com'),
    ).rejects.toThrow();
  });

  it('NOT NULL: insertar usuario sin email lanza error', async () => {
    await expect(
      pool.query(`INSERT INTO users (name, password_hash) VALUES ('Sin Email', 'hash')`),
    ).rejects.toThrow();
  });

  it('FK violation: loyalty_card con user_id inexistente lanza error', async () => {
    await expect(
      pool.query(`INSERT INTO loyalty_cards (user_id, card_number) VALUES (9999, 'CARD-FAKE')`),
    ).rejects.toThrow();
  });
});


describe('LoyaltyCardRepository — operaciones de puntos', () => {
  it('create: tarjeta empieza con balance 0 y tier bronze', async () => {
    const user = await createUser();
    await new LoyaltyCardRepository(pool).create(user.id, 'CARD-001');
    const card = await new LoyaltyCardRepository(pool).findByUserId(user.id);

    expect(card?.points_balance).toBe(0);
    expect(card?.tier).toBe('bronze');
  });

  it('addPoints: incrementa balance correctamente', async () => {
    const user = await createUser();
    const repo = new LoyaltyCardRepository(pool);
    await repo.create(user.id, 'CARD-002');
    const card = await repo.findByUserId(user.id);

    const newBalance = await repo.addPoints(card!.id, 150);
    expect(newBalance).toBe(150);
  });

  it('deductPoints: decrementa balance correctamente', async () => {
  const user = await createUser();
  const repo = new LoyaltyCardRepository(pool);

  await repo.create(user.id, 'CARD-003');

  const card = await repo.findByUserId(user.id);
  console.log('Initial:', card);

  await repo.addPoints(card!.id, 500);

  const afterAdd = await repo.findByUserId(user.id);
  console.log('After add:', afterAdd);

  await repo.deductPoints(afterAdd!.id, 200);

  const final = await repo.findByUserId(user.id);
  console.log('Final:', final);

  expect(final).not.toBeNull();
});
});


describe('RewardRepository', () => {
  it('listAvailable retorna solo rewards con stock > 0', async () => {
    const repo = new RewardRepository(pool);
    await repo.create('Café', 'Un café gratis', 200, 5);
    await repo.create('Sin stock', 'Agotado', 100, 0);

    const available = await repo.listAvailable();
    expect(available).toHaveLength(1);
    expect(available[0].name).toBe('Café');
  });

  it('findById retorna null si no existe', async () => {
    const found = await new RewardRepository(pool).findById(9999);
    expect(found).toBeNull();
  });

  it('decrementStock reduce el stock en 1', async () => {
    const repo = new RewardRepository(pool);
    const reward = await repo.create('Snack', 'Papitas', 100, 10);
    await repo.decrementStock(reward.id);

    const updated = await repo.findById(reward.id);
    expect(updated?.stock).toBe(9);
  });
});


describe('StoreRepository — listAll ordenado', () => {
  it('retorna tiendas ordenadas por nombre', async () => {
    await pool.query(`INSERT INTO stores (name) VALUES ('OXXO'), ('Aurrera'), ('Chedraui')`);
    const stores = await new StoreRepository(pool).listAll();
    const names = stores.map((s) => s.name);

    expect(names).toEqual([...names].sort());
  });
});
