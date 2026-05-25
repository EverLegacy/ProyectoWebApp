const express = require('express');
const router  = express.Router();
const { listRewards, redeemReward } = require('../controllers/rewardsController');
const auth = require('../middleware/auth');

router.get('/',        auth, listRewards);
router.post('/redeem', auth, redeemReward);

module.exports = router;
