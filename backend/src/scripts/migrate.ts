import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from '../infrastructure/postgres';

const SQL_DIR = join(__dirname, '..', 'models', 'postgres');

const FILES = ['schema.sql', 'migration_roles_and_reset.sql', 'seed.sql'];

async function run(): Promise<void> {
  for (const file of FILES) {
    const path = join(SQL_DIR, file);
    let sql: string;
    try {
      sql = readFileSync(path, 'utf-8');
    } catch {
      console.log(`Skipping ${file} (not found)`);
      continue;
    }
    console.log(`Applying ${file}...`);
    await pool.query(sql);
  }
  console.log('Migration complete.');
  await pool.end();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
