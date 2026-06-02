const express = require('express');
const router  = express.Router();
const { getBalance, addPoints } = require('../controllers/pointsController');
const auth = require('../middleware/auth');

router.get('/balance', auth, getBalance);
router.post('/add',    auth, addPoints);
console.log("POINTS ROUTES LOADED");

module.exports = router;
