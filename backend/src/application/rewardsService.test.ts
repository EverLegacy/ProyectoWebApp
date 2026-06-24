import { describe, it, expect, vi } from 'vitest';
import { RewardsService } from './rewardsService';
import { InsufficientPointsError, NotFoundError } from '../domain/errors';
import type { LoyaltyCardRepository, RewardRepository } from '../infrastructure/repositories';

vi.mock('../models/mongo', () => ({
  ActivityLog: { create: vi.fn().mockResolvedValue({}) },
}));

describe('RewardsService', () => {
  describe('listRewards', () => {
    describe('cuando hay recompensas disponibles', () => {
      it('debe retornar la lista', async () => {
        // Arrange
        const rewardRepo = {
          listAvailable: vi.fn().mockResolvedValue([{ id: 1, name: 'Snack', points_cost: 100 }]),
        } as unknown as RewardRepository;
        const service = new RewardsService({} as LoyaltyCardRepository, rewardRepo);

        // Act
        const result = await service.listRewards();

        // Assert
        expect(result).toHaveLength(1);
      });
    });
  });

  describe('redeemReward', () => {
    describe('cuando no hay puntos suficientes', () => {
      it('debe lanzar InsufficientPointsError', async () => {
        // Arrange
        const cardRepo = {
          findByUserId: vi.fn().mockResolvedValue({ id: 1, points_balance: 50 }),
        } as unknown as LoyaltyCardRepository;
        const rewardRepo = {
          findById: vi.fn().mockResolvedValue({ id: 2, name: 'Snack', points_cost: 100, stock: 5 }),
        } as unknown as RewardRepository;
        const service = new RewardsService(cardRepo, rewardRepo);

        // Act & Assert
        await expect(service.redeemReward(1, 2)).rejects.toBeInstanceOf(InsufficientPointsError);
      });
    });

    describe('cuando la recompensa no existe', () => {
      it('debe lanzar NotFoundError', async () => {
        // Arrange
        const cardRepo = {
          findByUserId: vi.fn().mockResolvedValue({ id: 1, points_balance: 500 }),
        } as unknown as LoyaltyCardRepository;
        const rewardRepo = {
          findById: vi.fn().mockResolvedValue(null),
        } as unknown as RewardRepository;
        const service = new RewardsService(cardRepo, rewardRepo);

        // Act & Assert
        await expect(service.redeemReward(1, 99)).rejects.toBeInstanceOf(NotFoundError);
      });
    });

    describe('cuando el canje es exitoso', () => {
      it('debe retornar código de canje', async () => {
        // Arrange
        const cardRepo = {
          findByUserId: vi.fn().mockResolvedValue({ id: 1, points_balance: 500 }),
          deductPoints: vi.fn().mockResolvedValue(undefined),
        } as unknown as LoyaltyCardRepository;
        const rewardRepo = {
          findById: vi.fn().mockResolvedValue({
            id: 2,
            name: 'Snack',
            points_cost: 100,
            stock: 5,
          }),
          decrementStock: vi.fn().mockResolvedValue(undefined),
          createRedemption: vi.fn().mockResolvedValue(undefined),
        } as unknown as RewardRepository;
        const service = new RewardsService(cardRepo, rewardRepo);

        // Act
        const result = await service.redeemReward(1, 2);

        // Assert
        expect(result.code).toMatch(/^PTS-/);
      });
    });
  });

  describe('createReward', () => {
    describe('cuando se crea recompensa', () => {
      it('debe retornar la recompensa creada', async () => {
        // Arrange
        const rewardRepo = {
          create: vi.fn().mockResolvedValue({ id: 3, name: 'New', points_cost: 200, stock: 5 }),
        } as unknown as RewardRepository;
        const service = new RewardsService({} as LoyaltyCardRepository, rewardRepo);

        // Act
        const result = await service.createReward('New', 'Desc', 200, 5);

        // Assert
        expect(result.id).toBe(3);
      });
    });
  });
});
