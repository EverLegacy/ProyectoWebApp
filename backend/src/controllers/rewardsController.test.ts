import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { InsufficientPointsError } from '../domain/errors';
import { createRewardsController } from './rewardsController';

function mockResponse(): Response {
  const res = {
    statusCode: 200,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
      return this;
    },
    body: undefined as unknown,
  };
  return res as unknown as Response;
}

describe('RewardsController', () => {
  describe('redeemReward', () => {
    describe('cuando no hay puntos suficientes', () => {
      it('debe responder 400', async () => {
        // Arrange
        const rewardsService = {
          redeemReward: vi.fn().mockRejectedValue(new InsufficientPointsError()),
        };
        const controller = createRewardsController(rewardsService as never);
        const req = {
          user: { id: 1, email: 'a@b.com' },
          body: { rewardId: 2 },
        } as Request;
        const res = mockResponse();

        // Act
        await controller.redeemReward(req, res);

        // Assert
        expect(res.statusCode).toBe(400);
      });
    });
  });

  describe('listRewards', () => {
    describe('cuando hay error', () => {
      it('debe responder 500', async () => {
        // Arrange
        const rewardsService = {
          listRewards: vi.fn().mockRejectedValue(new Error('db error')),
        };
        const controller = createRewardsController(rewardsService as never);
        const req = {} as Request;
        const res = mockResponse();

        // Act
        await controller.listRewards(req, res);

        // Assert
        expect(res.statusCode).toBe(500);
      });
    });

    describe('cuando hay recompensas', () => {
      it('debe retornar la lista', async () => {
        // Arrange
        const rewardsService = {
          listRewards: vi.fn().mockResolvedValue([{ id: 1, name: 'Snack' }]),
        };
        const controller = createRewardsController(rewardsService as never);
        const req = {} as Request;
        const res = mockResponse();

        // Act
        await controller.listRewards(req, res);

        // Assert
        expect(res.statusCode).toBe(200);
      });
    });
  });

  describe('createReward', () => {
    describe('cuando se crea recompensa', () => {
      it('debe responder 201', async () => {
        // Arrange
        const rewardsService = {
          createReward: vi.fn().mockResolvedValue({ id: 1, name: 'New Reward' }),
        };
        const controller = createRewardsController(rewardsService as never);
        const req = {
          body: { name: 'New Reward', description: 'Desc', points_cost: 100, stock: 10 },
        } as Request;
        const res = mockResponse();

        // Act
        await controller.createReward(req, res);

        // Assert
        expect(res.statusCode).toBe(201);
      });
    });
  });
});
