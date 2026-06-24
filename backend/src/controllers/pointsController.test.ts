import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { NotFoundError } from '../domain/errors';
import { createPointsController } from './pointsController';

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

describe('PointsController', () => {
  describe('getBalance', () => {
    describe('cuando no hay tarjeta', () => {
      it('debe responder 404', async () => {
        // Arrange
        const pointsService = {
          getBalance: vi.fn().mockRejectedValue(new NotFoundError('Card not found')),
        };
        const controller = createPointsController(pointsService as never);
        const req = { user: { id: 1, email: 'a@b.com' } } as Request;
        const res = mockResponse();

        // Act
        await controller.getBalance(req, res);

        // Assert
        expect(res.statusCode).toBe(404);
      });
    });

    describe('cuando existe tarjeta', () => {
      it('debe retornar el balance', async () => {
        // Arrange
        const pointsService = {
          getBalance: vi.fn().mockResolvedValue({ points_balance: 500, tier: 'gold' }),
        };
        const controller = createPointsController(pointsService as never);
        const req = { user: { id: 1, email: 'a@b.com' } } as Request;
        const res = mockResponse();

        // Act
        await controller.getBalance(req, res);

        // Assert
        expect(res.statusCode).toBe(200);
      });
    });
  });

  describe('addPoints', () => {
    describe('cuando hay error', () => {
      it('debe responder 500', async () => {
        // Arrange
        const pointsService = {
          addPoints: vi.fn().mockRejectedValue(new Error('db error')),
        };
        const controller = createPointsController(pointsService as never);
        const req = {
          user: { id: 1, email: 'a@b.com' },
          body: { storeId: 1, amount: 100 },
        } as Request;
        const res = mockResponse();

        // Act
        await controller.addPoints(req, res);

        // Assert
        expect(res.statusCode).toBe(500);
      });
    });

    describe('cuando se agregan puntos', () => {
      it('debe retornar puntos ganados', async () => {
        // Arrange
        const pointsService = {
          addPoints: vi.fn().mockResolvedValue({ pointsEarned: 100, newBalance: 600 }),
        };
        const controller = createPointsController(pointsService as never);
        const req = {
          user: { id: 1, email: 'a@b.com' },
          body: { storeId: 1, amount: 100 },
        } as Request;
        const res = mockResponse();

        // Act
        await controller.addPoints(req, res);

        // Assert
        expect(res.statusCode).toBe(200);
      });
    });
  });
});
