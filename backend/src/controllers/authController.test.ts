import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { InvalidTokenError } from '../domain/errors';
import { createAuthController } from './authController';

function mockResponse(): Response {
  const res = {
    statusCode: 200,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
      return this;
    },
    body: undefined as unknown,
  };
  return res as unknown as Response;
}

describe('AuthController', () => {
  describe('register', () => {
    describe('cuando hay error inesperado', () => {
      it('debe responder 500', async () => {
        // Arrange
        const authService = {
          register: vi.fn().mockRejectedValue(new Error('db error')),
        };
        const controller = createAuthController(authService as never);
        const req = { body: { name: 'T', email: 'a@b.com', password: 'secret123' } } as Request;
        const res = mockResponse();

        // Act
        await controller.register(req, res);

        // Assert
        expect(res.statusCode).toBe(500);
      });
    });

    describe('cuando el registro es exitoso', () => {
      it('debe responder 201', async () => {
        // Arrange
        const authService = {
          register: vi.fn().mockResolvedValue({ user: { id: 1, name: 'Test', email: 'a@b.com' } }),
        };
        const controller = createAuthController(authService as never);
        const req = { body: { name: 'Test', email: 'a@b.com', password: 'secret123' } } as Request;
        const res = mockResponse();

        // Act
        await controller.register(req, res);

        // Assert
        expect(res.statusCode).toBe(201);
      });
    });
  });

  describe('login', () => {
    describe('cuando el login es exitoso', () => {
      it('debe responder 200 con token', async () => {
        // Arrange
        const authService = {
          login: vi.fn().mockResolvedValue({ token: 'jwt-token' }),
        };
        const controller = createAuthController(authService as never);
        const req = { body: { email: 'a@b.com', password: 'secret123' } } as Request;
        const res = mockResponse();

        // Act
        await controller.login(req, res);

        // Assert
        expect(res.statusCode).toBe(200);
      });
    });
  });

  describe('me', () => {
    describe('cuando el usuario está autenticado', () => {
      it('debe retornar el perfil', async () => {
        // Arrange
        const authService = {
          getProfile: vi.fn().mockResolvedValue({ id: 1, name: 'Test', email: 'a@b.com' }),
        };
        const controller = createAuthController(authService as never);
        const req = { user: { id: 1, email: 'a@b.com' } } as Request;
        const res = mockResponse();

        // Act
        await controller.me(req, res);

        // Assert
        expect(res.statusCode).toBe(200);
      });
    });

    describe('cuando no hay usuario en request', () => {
      it('debe responder 401', async () => {
        // Arrange
        const controller = createAuthController({ getProfile: vi.fn() } as never);
        const req = {} as Request;
        const res = mockResponse();

        // Act
        await controller.me(req, res);

        // Assert
        expect(res.statusCode).toBe(401);
      });
    });
  });

  describe('forgotPassword', () => {
    describe('cuando la solicitud es procesada', () => {
      it('debe responder 200', async () => {
        // Arrange
        const authService = {
          forgotPassword: vi.fn().mockResolvedValue({ message: 'ok' }),
        };
        const controller = createAuthController(authService as never);
        const req = { body: { email: 'a@b.com' } } as Request;
        const res = mockResponse();

        // Act
        await controller.forgotPassword(req, res);

        // Assert
        expect(res.statusCode).toBe(200);
      });
    });
  });

  describe('resetPassword', () => {
    describe('cuando el token es inválido en controller', () => {
      it('debe responder 400', async () => {
        // Arrange
        const authService = {
          resetPassword: vi.fn().mockRejectedValue(new InvalidTokenError()),
        };
        const controller = createAuthController(authService as never);
        const req = { body: { token: 'bad', newPassword: 'newpass123' } } as Request;
        const res = mockResponse();

        // Act
        await controller.resetPassword(req, res);

        // Assert
        expect(res.statusCode).toBe(400);
      });
    });
  });
});
