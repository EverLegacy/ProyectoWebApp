import { describe, it, expect } from 'vitest';
import { generateRedemptionCode, hasSufficientPoints, generateCardNumber } from './rewards';

describe('generateRedemptionCode', () => {
  describe('cuando se genera un código', () => {
    it('debe incluir el prefijo PTS', () => {
      // Arrange
      const randomFn = () => 0.1;

      // Act
      const code = generateRedemptionCode(5, 10, randomFn);

      // Assert
      expect(code.startsWith('PTS-')).toBe(true);
    });
  });
});

describe('hasSufficientPoints', () => {
  describe('cuando el balance es menor al costo', () => {
    it('debe retornar false', () => {
      // Arrange
      const balance = 100;
      const cost = 200;

      // Act
      const result = hasSufficientPoints(balance, cost);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('cuando el balance es suficiente', () => {
    it('debe retornar true', () => {
      // Arrange
      const balance = 500;
      const cost = 200;

      // Act
      const result = hasSufficientPoints(balance, cost);

      // Assert
      expect(result).toBe(true);
    });
  });
});

describe('generateCardNumber', () => {
  describe('cuando se genera número de tarjeta', () => {
    it('debe usar el timestamp proporcionado', () => {
      // Arrange
      const timestamp = 1234567890;

      // Act
      const cardNumber = generateCardNumber(timestamp);

      // Assert
      expect(cardNumber).toBe('CARD-1234567890');
    });
  });
});
