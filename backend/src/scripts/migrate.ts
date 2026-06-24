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

    // Split into individual statements and run each one separately
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      try {
        await pool.query(statement);
      } catch (err) {
        console.error(`Failed statement in ${file}:\n${statement}\n`, err);
        throw err;
      }
    }
  }

  console.log('Migration complete.');
  await pool.end();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
