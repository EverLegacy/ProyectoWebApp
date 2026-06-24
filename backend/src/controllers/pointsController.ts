import type { Request, Response } from 'express';
import { PointsService } from '../application/pointsService';
import { NotFoundError } from '../domain/errors';

export function createPointsController(pointsService: PointsService) {
  return {
    async getBalance(req: Request, res: Response): Promise<void> {
      try {
        if (!req.user) {
          res.status(401).json({ error: 'Unauthorized' });
          return;
        }
        const balance = await pointsService.getBalance(req.user.id);
        res.json(balance);
      } catch (err) {
        if (err instanceof NotFoundError) {
          res.status(404).json({ error: err.message });
          return;
        }
        const message = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: message });
      }
    },

    async addPoints(req: Request, res: Response): Promise<void> {
      try {
        if (!req.user) {
          res.status(401).json({ error: 'Unauthorized' });
          return;
        }
        const { storeId, amount } = req.body;
        const result = await pointsService.addPoints({
          userId: req.user.id,
          storeId,
          amount,
        });
        res.json(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: message });
      }
    },
  };
}

export type PointsController = ReturnType<typeof createPointsController>;
