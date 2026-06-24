const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRedemptionCode(
  rewardId: number,
  cardId: number,
  randomFn: () => number = Math.random,
): string {
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += CODE_CHARS[Math.floor(randomFn() * CODE_CHARS.length)];
  }
  return `PTS-${code}-${rewardId}${cardId}`;
}

export function hasSufficientPoints(balance: number, cost: number): boolean {
  return balance >= cost;
}

export function generateCardNumber(timestamp: number = Date.now()): string {
  return `CARD-${timestamp}`;
}
