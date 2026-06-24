import { Pool } from 'pg';
import { logInfo, logError } from '../logger/logger';

const connectionString = process.env.DATABASE_URL;

export const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT ?? 5432),
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
    });

export async function connectPostgres(): Promise<void> {
  try {
    await pool.query('SELECT 1');
    logInfo('postgres_connected');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logError('postgres_connection_error', { message });
    process.exit(1);
  }
}

export type QueryResultRow = Record<string, unknown>;