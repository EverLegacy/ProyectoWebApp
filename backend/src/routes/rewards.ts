import { Router } from 'express';
import type { RewardsController } from '../controllers/rewardsController';
import { authMiddleware } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';

export function createRewardsRoutes(rewardsController: RewardsController): Router {
  const router = Router();

  router.get('/', authMiddleware, (req, res) => void rewardsController.listRewards(req, res));
  router.post('/redeem', authMiddleware, (req, res) => void rewardsController.redeemReward(req, res));
  router.post('/', authMiddleware, requireAdmin, (req, res) =>
    void rewardsController.createReward(req, res),
  );

  return router;
}
