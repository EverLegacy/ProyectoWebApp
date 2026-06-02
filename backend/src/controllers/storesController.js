const { pool } = require('../config/postgres');
const logger = require('../logger/logger');

async function listStores(_req, res) {
  try {
    logger.info('DATADOG_TEST');

    const { rows } = await pool.query(
      'SELECT * FROM stores ORDER BY name'
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listStores };