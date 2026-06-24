import type { Request, Response } from 'express';
import { RewardsService } from '../application/rewardsService';
import { InsufficientPointsError, NotFoundError } from '../domain/errors';

export function createRewardsController(rewardsService: RewardsService) {
  return {
    async listRewards(_req: Request, res: Response): Promise<void> {
      try {
        const rewards = await rewardsService.listRewards();
        res.json(rewards);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: message });
      }
    },

    async redeemReward(req: Request, res: Response): Promise<void> {
      try {
        if (!req.user) {
          res.status(401).json({ error: 'Unauthorized' });
          return;
        }
        const result = await rewardsService.redeemReward(req.user.id, req.body.rewardId);
        res.json(result);
      } catch (err) {
        if (err instanceof NotFoundError) {
          res.status(404).json({ error: err.message });
          return;
        }
        if (err instanceof InsufficientPointsError) {
          res.status(400).json({ error: err.message });
          return;
        }
        const message = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: message });
      }
    },

    async createReward(req: Request, res: Response): Promise<void> {
      try {
        const { name, description, points_cost, stock } = req.body;
        const reward = await rewardsService.createReward(
          name,
          description,
          points_cost,
          stock ?? 0,
        );
        res.status(201).json(reward);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: message });
      }
    },
  };
}

export type RewardsController = ReturnType<typeof createRewardsController>;
