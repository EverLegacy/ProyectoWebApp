import { describe, it, expect } from 'vitest';
import { redactObject, redactValue } from './redact';

describe('redactObject', () => {
  describe('cuando el objeto contiene password', () => {
    it('debe redactar el campo password', () => {
      
      const input = { password: 'secret123', userId: 1 };

    
      const result = redactObject(input);

     
      expect(result.password).toBe('[REDACTED]');
    });
  });

  describe('cuando el header Authorization contiene Bearer token', () => {
    it('debe redactar el token en redactValue', () => {
      
      const token = 'Bearer eyJhbGciOiJIUzI1NiJ9';


      const result = redactValue(token);

      
      expect(result).toBe('Bearer [REDACTED]');
    });
  });
});
