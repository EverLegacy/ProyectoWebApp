const { pool } = require('../config/postgres');
const ActivityLog = require('../models/mongo/ActivityLog');

async function getBalance(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT points_balance, tier, card_number FROM loyalty_cards WHERE user_id=$1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Card not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addPoints(req, res) {
  const { storeId, amount } = req.body;
  const pointsEarned = Math.floor(amount); // 1 point per peso
  try {
    const { rows: cards } = await pool.query(
      'SELECT id FROM loyalty_cards WHERE user_id=$1', [req.user.id]
    );
    if (!cards.length) return res.status(404).json({ error: 'Card not found' });
    const cardId = cards[0].id;

    await pool.query(
      'INSERT INTO transactions (card_id, store_id, amount, points_earned) VALUES ($1,$2,$3,$4)',
      [cardId, storeId, amount, pointsEarned]
    );
    const { rows: updated } = await pool.query(
      'UPDATE loyalty_cards SET points_balance = points_balance + $1 WHERE id=$2 RETURNING points_balance',
      [pointsEarned, cardId]
    );

    await ActivityLog.create({
      userId: req.user.id,
      action: 'scan',
      metadata: { storeId, amount, pointsEarned },
    });

    res.json({ pointsEarned, newBalance: updated[0].points_balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getBalance, addPoints };
