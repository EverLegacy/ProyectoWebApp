import { describe, it, expect } from 'vitest';
import { redactClientData } from './redact';

describe('redactClientData', () => {
  describe('cuando el objeto contiene email', () => {
    it('debe redactar el email', () => {
      // Arrange
      const data = { email: 'user@test.com', eventType: 'login' };

      // Act
      const result = redactClientData(data);

      // Assert
      expect(result.email).toBe('[REDACTED]');
    });
  });
});
