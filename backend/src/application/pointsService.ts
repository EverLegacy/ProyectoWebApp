import { calculatePointsEarned, validatePurchaseAmount } from '../domain/points';
import { NotFoundError } from '../domain/errors';
import type { LoyaltyCardRepository, TransactionRepository } from '../infrastructure/repositories';
import { ActivityLog } from '../models/mongo';
import { logInfo } from '../logger/logger';

export interface AddPointsInput {
  userId: number;
  storeId: number;
  amount: number;
}

export class PointsService {
  constructor(
    private readonly cardRepo: LoyaltyCardRepository,
    private readonly transactionRepo: TransactionRepository,
  ) {}

  async getBalance(userId: number) {
    const card = await this.cardRepo.findByUserId(userId);
    if (!card) {
      throw new NotFoundError('Card not found');
    }
    return {
      points_balance: card.points_balance,
      tier: card.tier,
      card_number: card.card_number,
    };
  }

  async addPoints(input: AddPointsInput) {
    validatePurchaseAmount(input.amount);
    const pointsEarned = calculatePointsEarned(input.amount);

    const card = await this.cardRepo.findByUserId(input.userId);
    if (!card) {
      throw new NotFoundError('Card not found');
    }

    await this.transactionRepo.create(card.id, input.storeId, input.amount, pointsEarned);
    const newBalance = await this.cardRepo.addPoints(card.id, pointsEarned);

    await ActivityLog.create({
      userId: input.userId,
      action: 'scan',
      metadata: { storeId: input.storeId, amount: input.amount, pointsEarned },
    });

    logInfo('points_added', {
      userId: input.userId,
      storeId: input.storeId,
      pointsEarned,
      newBalance,
    });

    return { pointsEarned, newBalance };
  }
}
