import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidPassword, isValidRegistrationInput } from './validation';

describe('isValidEmail', () => {
  describe('cuando el email tiene formato válido', () => {
    it('debe retornar true', () => {
      // Arrange
      const email = 'user@example.com';

      // Act
      const result = isValidEmail(email);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('cuando el email es inválido', () => {
    it('debe retornar false', () => {
      // Arrange
      const email = 'not-an-email';

      // Act
      const result = isValidEmail(email);

      // Assert
      expect(result).toBe(false);
    });
  });
});

describe('isValidPassword', () => {
  describe('cuando la contraseña tiene menos de 6 caracteres', () => {
    it('debe retornar false', () => {
      // Arrange
      const password = '12345';

      // Act
      const result = isValidPassword(password);

      // Assert
      expect(result).toBe(false);
    });
  });
});

describe('isValidRegistrationInput', () => {
  describe('cuando todos los campos son válidos', () => {
    it('debe retornar true', () => {
      // Arrange
      const name = 'Test User';
      const email = 'test@example.com';
      const password = 'secret123';

      // Act
      const result = isValidRegistrationInput(name, email, password);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('cuando el nombre está vacío', () => {
    it('debe retornar false', () => {
      // Arrange
      const name = '   ';
      const email = 'test@example.com';
      const password = 'secret123';

      // Act
      const result = isValidRegistrationInput(name, email, password);

      // Assert
      expect(result).toBe(false);
    });
  });
});
