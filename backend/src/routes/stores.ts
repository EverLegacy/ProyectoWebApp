import { Router } from 'express';
import type { StoresController } from '../controllers/storesController';
import { authMiddleware } from '../middleware/auth';

export function createStoresRoutes(storesController: StoresController): Router {
  const router = Router();

  router.get('/', authMiddleware, (req, res) => void storesController.listStores(req, res));

  return router;
}
