const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { pool } = require('../config/postgres');

async function register(req, res) {
  const { name, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id, name, email',
      [name, email, hash]
    );
    const cardNumber = 'CARD-' + Date.now();
    await pool.query(
      'INSERT INTO loyalty_cards (user_id, card_number) VALUES ($1,$2)',
      [rows[0].id, cardNumber]
    );
    res.status(201).json({ user: rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already in use' });
    res.status(500).json({ error: err.message });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign(
      { id: rows[0].id, email: rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function me(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id=$1',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { register, login, me };
