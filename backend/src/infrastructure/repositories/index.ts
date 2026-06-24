import type { Pool } from 'pg';

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  password_hash?: string;
  role?: string;
  created_at?: Date;
}

export class UserRepository {
  constructor(private readonly pool: Pool) {}

  async findByEmail(email: string): Promise<UserRecord | null> {
    const { rows } = await this.pool.query<UserRecord>(
      'SELECT * FROM users WHERE email=$1',
      [email],
    );
    return rows[0] ?? null;
  }

  async findById(id: number): Promise<UserRecord | null> {
    const { rows } = await this.pool.query<UserRecord>(
      'SELECT id, name, email, role, created_at FROM users WHERE id=$1',
      [id],
    );
    return rows[0] ?? null;
  }

  async create(name: string, email: string, passwordHash: string): Promise<UserRecord> {
    const { rows } = await this.pool.query<UserRecord>(
      'INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id, name, email',
      [name, email, passwordHash],
    );
    return rows[0];
  }

  async setResetToken(userId: number, token: string, expires: Date): Promise<void> {
    await this.pool.query(
      'UPDATE users SET reset_token=$1, reset_token_expires=$2 WHERE id=$3',
      [token, expires, userId],
    );
  }

  async findByResetToken(token: string): Promise<{ id: number } | null> {
    const { rows } = await this.pool.query<{ id: number }>(
      'SELECT id FROM users WHERE reset_token=$1 AND reset_token_expires > NOW()',
      [token],
    );
    return rows[0] ?? null;
  }

  async updatePassword(userId: number, passwordHash: string): Promise<void> {
    await this.pool.query(
      'UPDATE users SET password_hash=$1, reset_token=NULL, reset_token_expires=NULL WHERE id=$2',
      [passwordHash, userId],
    );
  }
}

export interface LoyaltyCardRecord {
  id: number;
  points_balance: number;
  tier?: string;
  card_number?: string;
}

export class LoyaltyCardRepository {
  constructor(private readonly pool: Pool) {}

  async create(userId: number, cardNumber: string): Promise<void> {
    await this.pool.query(
      'INSERT INTO loyalty_cards (user_id, card_number) VALUES ($1,$2)',
      [userId, cardNumber],
    );
  }

  async findByUserId(userId: number): Promise<LoyaltyCardRecord | null> {
    const { rows } = await this.pool.query<LoyaltyCardRecord>(
      'SELECT id, points_balance, tier, card_number FROM loyalty_cards WHERE user_id=$1',
      [userId],
    );
    return rows[0] ?? null;
  }

  async addPoints(cardId: number, points: number): Promise<number> {
    const { rows } = await this.pool.query<{ points_balance: number }>(
      'UPDATE loyalty_cards SET points_balance = points_balance + $1 WHERE id=$2 RETURNING points_balance',
      [points, cardId],
    );
    return rows[0].points_balance;
  }

  async deductPoints(cardId: number, points: number): Promise<void> {
    await this.pool.query(
      'UPDATE loyalty_cards SET points_balance = points_balance - $1 WHERE id=$2',
      [points, cardId],
    );
  }
}

export class TransactionRepository {
  constructor(private readonly pool: Pool) {}

  async create(cardId: number, storeId: number, amount: number, pointsEarned: number): Promise<void> {
    await this.pool.query(
      'INSERT INTO transactions (card_id, store_id, amount, points_earned) VALUES ($1,$2,$3,$4)',
      [cardId, storeId, amount, pointsEarned],
    );
  }
}

export interface RewardRecord {
  id: number;
  name: string;
  description?: string;
  points_cost: number;
  stock: number;
}

export class RewardRepository {
  constructor(private readonly pool: Pool) {}

  async listAvailable(): Promise<RewardRecord[]> {
    const { rows } = await this.pool.query<RewardRecord>(
      'SELECT * FROM rewards WHERE stock > 0 ORDER BY points_cost',
    );
    return rows;
  }

  async findById(rewardId: number): Promise<RewardRecord | null> {
    const { rows } = await this.pool.query<RewardRecord>(
      'SELECT * FROM rewards WHERE id=$1',
      [rewardId],
    );
    return rows[0] ?? null;
  }

  async decrementStock(rewardId: number): Promise<void> {
    await this.pool.query('UPDATE rewards SET stock = stock - 1 WHERE id=$1', [rewardId]);
  }

  async create(
    name: string,
    description: string,
    pointsCost: number,
    stock: number,
  ): Promise<RewardRecord> {
    const { rows } = await this.pool.query<RewardRecord>(
      'INSERT INTO rewards (name, description, points_cost, stock) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, description, pointsCost, stock],
    );
    return rows[0];
  }

  async createRedemption(cardId: number, rewardId: number): Promise<void> {
    await this.pool.query(
      'INSERT INTO redemptions (card_id, reward_id, status) VALUES ($1,$2,$3)',
      [cardId, rewardId, 'completed'],
    );
  }
}

export interface StoreRecord {
  id: number;
  name: string;
  location?: string;
  category?: string;
}

export class StoreRepository {
  constructor(private readonly pool: Pool) {}

  async listAll(): Promise<StoreRecord[]> {
    const { rows } = await this.pool.query<StoreRecord>(
      'SELECT * FROM stores ORDER BY name',
    );
    return rows;
  }
}
