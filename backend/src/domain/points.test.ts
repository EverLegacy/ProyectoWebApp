import { describe, it, expect } from 'vitest';
import { calculatePointsEarned, validatePurchaseAmount } from './points';

describe('calculatePointsEarned', () => {
  describe('cuando el monto es válido', () => {
    it('debe calcular 1 punto por peso entero', () => {
      // Arrange
      const amount = 150.75;

      // Act
      const result = calculatePointsEarned(amount);

      // Assert
      expect(result).toBe(150);
    });
  });

  describe('cuando el monto es negativo', () => {
    it('debe lanzar error', () => {
      // Arrange
      const amount = -10;

      // Act & Assert
      expect(() => calculatePointsEarned(amount)).toThrow('Amount must be non-negative');
    });
  });
});

describe('validatePurchaseAmount', () => {
  describe('cuando el monto es cero', () => {
    it('debe lanzar error', () => {
      // Arrange
      const amount = 0;

      // Act & Assert
      expect(() => validatePurchaseAmount(amount)).toThrow('Amount must be greater than zero');
    });
  });

  describe('cuando el monto es NaN', () => {
    it('debe lanzar error', () => {
      // Arrange
      const amount = NaN;

      // Act & Assert
      expect(() => validatePurchaseAmount(amount)).toThrow('Invalid amount');
    });
  });
});
