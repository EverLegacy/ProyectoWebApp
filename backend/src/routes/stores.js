const express = require('express');
const router  = express.Router();
const { listStores } = require('../controllers/storesController');
const auth = require('../middleware/auth');

router.get('/', auth, listStores);

module.exports = router;
