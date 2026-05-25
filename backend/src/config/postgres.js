const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.POSTGRES_HOST,
  port:     process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user:     process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

async function connectPostgres() {
  try {
    await pool.query('SELECT 1');
    console.log('PostgreSQL connected');
  } catch (err) {
    console.error('PostgreSQL connection error:', err.message);
    process.exit(1);
  }
}

module.exports = { pool, connectPostgres };
