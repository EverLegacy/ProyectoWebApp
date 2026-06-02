require('dotenv').config();

require('dd-trace').init({
  service: 'mi-api',
  env: process.env.NODE_ENV || 'dev',
  logInjection: true,
});

const express = require('express');
const cors = require('cors');
const { connectPostgres } = require('./config/postgres');
const { connectMongo } = require('./config/mongo');

const authRoutes    = require('./routes/auth');
const pointsRoutes  = require('./routes/points');
const rewardsRoutes = require('./routes/rewards');
const storesRoutes  = require('./routes/stores');

const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

app.use(requestLogger);

app.use('/api/auth',    authRoutes);
app.use('/api/points',  pointsRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/stores',  storesRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

(async () => {
  await connectPostgres();
  await connectMongo();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();

app.use((req, res, next) => {
  console.log("HIT:", req.method, req.url);
  next();
});