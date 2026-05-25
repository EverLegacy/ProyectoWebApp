const { pool } = require('../config/postgres');

async function listStores(_req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM stores ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listStores };
