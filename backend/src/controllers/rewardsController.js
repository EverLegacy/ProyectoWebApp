const { pool } = require('../config/postgres');
const ActivityLog = require('../models/mongo/ActivityLog');

async function listRewards(_req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM rewards WHERE stock > 0 ORDER BY points_cost');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function redeemReward(req, res) {
  const { rewardId } = req.body;
  try {
    const { rows: cards } = await pool.query(
      'SELECT id, points_balance FROM loyalty_cards WHERE user_id=$1', [req.user.id]
    );
    const { rows: rewards } = await pool.query('SELECT * FROM rewards WHERE id=$1', [rewardId]);
    if (!cards.length || !rewards.length) return res.status(404).json({ error: 'Not found' });

    const card   = cards[0];
    const reward = rewards[0];

    if (card.points_balance < reward.points_cost)
      return res.status(400).json({ error: 'Insufficient points' });

    await pool.query(
      'UPDATE loyalty_cards SET points_balance = points_balance - $1 WHERE id=$2',
      [reward.points_cost, card.id]
    );
    await pool.query('UPDATE rewards SET stock = stock - 1 WHERE id=$1', [rewardId]);
    await pool.query(
      'INSERT INTO redemptions (card_id, reward_id, status) VALUES ($1,$2,$3)',
      [card.id, rewardId, 'completed']
    );

    await ActivityLog.create({
      userId: req.user.id,
      action: 'redeem',
      metadata: { rewardId, pointsSpent: reward.points_cost },
    });

    res.json({ message: 'Reward redeemed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listRewards, redeemReward };
