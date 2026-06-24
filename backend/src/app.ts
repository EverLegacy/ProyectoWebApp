import express from 'express';
import cors from 'cors';
import { pool } from './infrastructure/postgres';
import {
  UserRepository,
  LoyaltyCardRepository,
  TransactionRepository,
  RewardRepository,
  StoreRepository,
} from './infrastructure/repositories';
import { AuthService } from './application/authService';
import { PointsService } from './application/pointsService';
import { RewardsService } from './application/rewardsService';
import { StoresService } from './application/storesService';
import { createAuthController } from './controllers/authController';
import { createPointsController } from './controllers/pointsController';
import { createRewardsController } from './controllers/rewardsController';
import { createStoresController } from './controllers/storesController';
import { createAuthRoutes } from './routes/auth';
import { createPointsRoutes } from './routes/points';
import { createRewardsRoutes } from './routes/rewards';
import { createStoresRoutes } from './routes/stores';
import { correlationId } from './middleware/correlationId';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  const userRepo = new UserRepository(pool);
  const cardRepo = new LoyaltyCardRepository(pool);
  const transactionRepo = new TransactionRepository(pool);
  const rewardRepo = new RewardRepository(pool);
  const storeRepo = new StoreRepository(pool);

  const authService = new AuthService(userRepo, cardRepo);
  const pointsService = new PointsService(cardRepo, transactionRepo);
  const rewardsService = new RewardsService(cardRepo, rewardRepo);
  const storesService = new StoresService(storeRepo);

  const authController = createAuthController(authService);
  const pointsController = createPointsController(pointsService);
  const rewardsController = createRewardsController(rewardsService);
  const storesController = createStoresController(storesService);

  const corsOrigin = process.env.CORS_ORIGIN;
  app.use(cors(corsOrigin ? { origin: corsOrigin } : {}));
  app.use(express.json());
  app.use(correlationId);
  app.use(requestLogger);

  app.use('/api/auth', createAuthRoutes(authController));
  app.use('/api/points', createPointsRoutes(pointsController));
  app.use('/api/rewards', createRewardsRoutes(rewardsController));
  app.use('/api/stores', createStoresRoutes(storesController));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(errorHandler);

  return app;
}