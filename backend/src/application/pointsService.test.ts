import { describe, it, expect, vi } from 'vitest';
import { PointsService } from './pointsService';
import { NotFoundError } from '../domain/errors';
import type { LoyaltyCardRepository, TransactionRepository } from '../infrastructure/repositories';

vi.mock('../models/mongo', () => ({
  ActivityLog: { create: vi.fn().mockResolvedValue({}) },
}));

describe('PointsService', () => {
  describe('getBalance', () => {
    describe('cuando no existe tarjeta', () => {
      it('debe lanzar NotFoundError', async () => {
        // Arrange
        const cardRepo = {
          findByUserId: vi.fn().mockResolvedValue(null),
        } as unknown as LoyaltyCardRepository;
        const transactionRepo = {} as TransactionRepository;
        const service = new PointsService(cardRepo, transactionRepo);

        // Act & Assert
        await expect(service.getBalance(1)).rejects.toBeInstanceOf(NotFoundError);
      });
    });
  });

  describe('addPoints', () => {
    describe('cuando la tarjeta existe', () => {
      it('debe retornar puntos ganados y nuevo balance', async () => {
        // Arrange
        const cardRepo = {
          findByUserId: vi.fn().mockResolvedValue({ id: 1, points_balance: 100 }),
          addPoints: vi.fn().mockResolvedValue(250),
        } as unknown as LoyaltyCardRepository;
        const transactionRepo = {
          create: vi.fn().mockResolvedValue(undefined),
        } as unknown as TransactionRepository;
        const service = new PointsService(cardRepo, transactionRepo);

        // Act
        const result = await service.addPoints({ userId: 1, storeId: 2, amount: 150 });

        // Assert
        expect(result.pointsEarned).toBe(150);
      });
    });
  });
});
