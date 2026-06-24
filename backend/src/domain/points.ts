export function calculatePointsEarned(amount: number): number {
  if (amount < 0) {
    throw new Error('Amount must be non-negative');
  }
  return Math.floor(amount);
}

export function validatePurchaseAmount(amount: number): void {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    throw new Error('Invalid amount');
  }
  if (amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }
}
