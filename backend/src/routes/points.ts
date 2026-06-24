import { Router } from 'express';
import type { PointsController } from '../controllers/pointsController';
import { authMiddleware } from '../middleware/auth';

export function createPointsRoutes(pointsController: PointsController): Router {
  const router = Router();

  router.get('/balance', authMiddleware, (req, res) => void pointsController.getBalance(req, res));
  router.post('/add', authMiddleware, (req, res) => void pointsController.addPoints(req, res));

  return router;
}
