import { generateRedemptionCode, hasSufficientPoints } from '../domain/rewards';
import { InsufficientPointsError, NotFoundError } from '../domain/errors';
import type { LoyaltyCardRepository, RewardRepository } from '../infrastructure/repositories';
import { ActivityLog } from '../models/mongo';
import { logInfo } from '../logger/logger';

export class RewardsService {
  constructor(
    private readonly cardRepo: LoyaltyCardRepository,
    private readonly rewardRepo: RewardRepository,
  ) {}

  async listRewards() {
    return this.rewardRepo.listAvailable();
  }

  async redeemReward(userId: number, rewardId: number) {
    const card = await this.cardRepo.findByUserId(userId);
    const reward = await this.rewardRepo.findById(rewardId);

    if (!card || !reward) {
      throw new NotFoundError('Not found');
    }

    if (!hasSufficientPoints(card.points_balance, reward.points_cost)) {
      throw new InsufficientPointsError();
    }

    const code = generateRedemptionCode(rewardId, card.id);

    await this.cardRepo.deductPoints(card.id, reward.points_cost);
    await this.rewardRepo.decrementStock(rewardId);
    await this.rewardRepo.createRedemption(card.id, rewardId);

    await ActivityLog.create({
      userId,
      action: 'redeem',
      metadata: { rewardId, pointsSpent: reward.points_cost },
    });

    logInfo('reward_redeemed', {
      userId,
      rewardId,
      pointsSpent: reward.points_cost,
    });

    return {
      message: 'Reward redeemed successfully',
      code,
      reward: reward.name,
      pointsSpent: reward.points_cost,
    };
  }

  async createReward(
    name: string,
    description: string,
    pointsCost: number,
    stock: number,
  ) {
    const reward = await this.rewardRepo.create(name, description, pointsCost, stock ?? 0);
    logInfo('reward_created', { rewardId: reward.id });
    return reward;
  }
}
