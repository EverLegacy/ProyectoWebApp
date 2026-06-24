import { describe, it, expect } from 'vitest';
import {
  DuplicateEmailError,
  InvalidCredentialsError,
  NotFoundError,
  InsufficientPointsError,
  InvalidTokenError,
} from './errors';

describe('Domain Errors', () => {
  describe('DuplicateEmailError', () => {
    it('debe tener el nombre correcto', () => {
      // Arrange & Act
      const error = new DuplicateEmailError();

      // Assert
      expect(error.name).toBe('DuplicateEmailError');
    });
  });

  describe('InvalidCredentialsError', () => {
    it('debe tener el mensaje correcto', () => {
      // Arrange & Act
      const error = new InvalidCredentialsError();

      // Assert
      expect(error.message).toBe('Invalid credentials');
    });
  });

  describe('NotFoundError', () => {
    it('debe aceptar mensaje personalizado', () => {
      // Arrange & Act
      const error = new NotFoundError('Card not found');

      // Assert
      expect(error.message).toBe('Card not found');
    });
  });

  describe('InsufficientPointsError', () => {
    it('debe tener el nombre correcto', () => {
      // Arrange & Act
      const error = new InsufficientPointsError();

      // Assert
      expect(error.name).toBe('InsufficientPointsError');
    });
  });

  describe('InvalidTokenError', () => {
    it('debe tener el mensaje en español', () => {
      // Arrange & Act
      const error = new InvalidTokenError();

      // Assert
      expect(error.message).toBe('Token inválido o expirado');
    });
  });
});
