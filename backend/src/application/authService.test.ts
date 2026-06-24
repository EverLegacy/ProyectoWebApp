import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from './authService';
import {
  DuplicateEmailError,
  InvalidCredentialsError,
  InvalidTokenError,
} from '../domain/errors';
import type { UserRepository, LoyaltyCardRepository } from '../infrastructure/repositories';

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: { sign: vi.fn() },
}));

describe('AuthService', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1h';
    vi.clearAllMocks();
  });

  describe('register', () => {
    describe('cuando los datos son inválidos', () => {
      it('debe lanzar error', async () => {
        // Arrange
        const service = new AuthService({} as UserRepository, {} as LoyaltyCardRepository);

        // Act & Assert
        await expect(
          service.register({ name: '', email: 'bad', password: '12' }),
        ).rejects.toThrow('Invalid registration data');
      });
    });

    describe('cuando el email ya existe', () => {
      it('debe lanzar DuplicateEmailError', async () => {
        // Arrange
        const userRepo = {
          create: vi.fn().mockRejectedValue({ code: '23505' }),
        } as unknown as UserRepository;
        const cardRepo = {} as LoyaltyCardRepository;
        const service = new AuthService(userRepo, cardRepo);
        vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);

        // Act & Assert
        await expect(
          service.register({ name: 'Test', email: 'a@b.com', password: 'secret123' }),
        ).rejects.toBeInstanceOf(DuplicateEmailError);
      });
    });

    describe('cuando los datos son válidos', () => {
      it('debe crear usuario y tarjeta', async () => {
        // Arrange
        const userRepo = {
          create: vi.fn().mockResolvedValue({ id: 1, name: 'Test', email: 'a@b.com' }),
        } as unknown as UserRepository;
        const cardRepo = {
          create: vi.fn().mockResolvedValue(undefined),
        } as unknown as LoyaltyCardRepository;
        const service = new AuthService(userRepo, cardRepo);
        vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);

        // Act
        const result = await service.register({
          name: 'Test',
          email: 'a@b.com',
          password: 'secret123',
        });

        // Assert
        expect(result.user.id).toBe(1);
      });
    });
  });

  describe('login', () => {
    describe('cuando las credenciales son inválidas', () => {
      it('debe lanzar InvalidCredentialsError', async () => {
        // Arrange
        const userRepo = {
          findByEmail: vi.fn().mockResolvedValue(null),
        } as unknown as UserRepository;
        const service = new AuthService(userRepo, {} as LoyaltyCardRepository);

        // Act & Assert
        await expect(
          service.login({ email: 'a@b.com', password: 'wrong' }),
        ).rejects.toBeInstanceOf(InvalidCredentialsError);
      });
    });

    describe('cuando las credenciales son válidas', () => {
      it('debe retornar un token', async () => {
        // Arrange
        const userRepo = {
          findByEmail: vi.fn().mockResolvedValue({
            id: 1,
            email: 'a@b.com',
            password_hash: 'hash',
            role: 'user',
          }),
        } as unknown as UserRepository;
        const service = new AuthService(userRepo, {} as LoyaltyCardRepository);
        vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
        vi.mocked(jwt.sign).mockReturnValue('token-123' as never);

        // Act
        const result = await service.login({ email: 'a@b.com', password: 'secret123' });

        // Assert
        expect(result.token).toBe('token-123');
      });
    });
  });

  describe('forgotPassword', () => {
    describe('cuando el email existe', () => {
      it('debe generar token de reset', async () => {
        // Arrange
        const userRepo = {
          findByEmail: vi.fn().mockResolvedValue({ id: 1, email: 'a@b.com' }),
          setResetToken: vi.fn().mockResolvedValue(undefined),
        } as unknown as UserRepository;
        const service = new AuthService(userRepo, {} as LoyaltyCardRepository);

        // Act
        const result = await service.forgotPassword('a@b.com');

        // Assert
        expect(result.resetToken).toBeDefined();
      });
    });

    describe('cuando el email no existe', () => {
      it('debe retornar mensaje genérico sin token', async () => {
        // Arrange
        const userRepo = {
          findByEmail: vi.fn().mockResolvedValue(null),
        } as unknown as UserRepository;
        const service = new AuthService(userRepo, {} as LoyaltyCardRepository);

        // Act
        const result = await service.forgotPassword('missing@example.com');

        // Assert
        expect(result.resetToken).toBeUndefined();
      });
    });
  });

  describe('resetPassword', () => {
    describe('cuando el token es inválido', () => {
      it('debe lanzar InvalidTokenError', async () => {
        // Arrange
        const userRepo = {
          findByResetToken: vi.fn().mockResolvedValue(null),
        } as unknown as UserRepository;
        const service = new AuthService(userRepo, {} as LoyaltyCardRepository);

        // Act & Assert
        await expect(service.resetPassword('bad-token', 'newpass123')).rejects.toBeInstanceOf(
          InvalidTokenError,
        );
      });
    });

    describe('cuando el token es válido', () => {
      it('debe actualizar la contraseña', async () => {
        // Arrange
        const userRepo = {
          findByResetToken: vi.fn().mockResolvedValue({ id: 1 }),
          updatePassword: vi.fn().mockResolvedValue(undefined),
        } as unknown as UserRepository;
        const service = new AuthService(userRepo, {} as LoyaltyCardRepository);
        vi.mocked(bcrypt.hash).mockResolvedValue('newhash' as never);

        // Act
        const result = await service.resetPassword('valid-token', 'newpass123');

        // Assert
        expect(result.message).toContain('actualizada');
      });
    });
  });

  describe('getProfile', () => {
    describe('cuando el usuario no existe', () => {
      it('debe lanzar InvalidCredentialsError', async () => {
        // Arrange
        const userRepo = {
          findById: vi.fn().mockResolvedValue(null),
        } as unknown as UserRepository;
        const service = new AuthService(userRepo, {} as LoyaltyCardRepository);

        // Act & Assert
        await expect(service.getProfile(99)).rejects.toBeInstanceOf(InvalidCredentialsError);
      });
    });

    describe('cuando el usuario existe', () => {
      it('debe retornar el perfil', async () => {
        // Arrange
        const userRepo = {
          findById: vi.fn().mockResolvedValue({ id: 1, name: 'Test', email: 'a@b.com' }),
        } as unknown as UserRepository;
        const service = new AuthService(userRepo, {} as LoyaltyCardRepository);

        // Act
        const result = await service.getProfile(1);

        // Assert
        expect(result.id).toBe(1);
      });
    });
  });
});
