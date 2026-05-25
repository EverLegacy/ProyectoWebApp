require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectPostgres } = require('./config/postgres');
const { connectMongo } = require('./config/mongo');

const authRoutes    = require('./routes/auth');
const pointsRoutes  = require('./routes/points');
const rewardsRoutes = require('./routes/rewards');
const storesRoutes  = require('./routes/stores');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',    authRoutes);
app.use('/api/points',  pointsRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/stores',  storesRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;

(async () => {
  await connectPostgres();
  await connectMongo();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
