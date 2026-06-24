import type { Request, Response } from 'express';
import { AuthService } from '../application/authService';
import {
  DuplicateEmailError,
  InvalidCredentialsError,
  InvalidTokenError,
} from '../domain/errors';

export function createAuthController(authService: AuthService) {
  return {
    async register(req: Request, res: Response): Promise<void> {
      try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
      } catch (err) {
        if (err instanceof DuplicateEmailError) {
          res.status(409).json({ error: err.message });
          return;
        }
        const message = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: message });
      }
    },

    async login(req: Request, res: Response): Promise<void> {
      try {
        const result = await authService.login(req.body);
        res.json(result);
      } catch (err) {
        if (err instanceof InvalidCredentialsError) {
          res.status(401).json({ error: err.message });
          return;
        }
        const message = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: message });
      }
    },

    async me(req: Request, res: Response): Promise<void> {
      try {
        if (!req.user) {
          res.status(401).json({ error: 'Unauthorized' });
          return;
        }
        const user = await authService.getProfile(req.user.id);
        res.json(user);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: message });
      }
    },

    async forgotPassword(req: Request, res: Response): Promise<void> {
      try {
        const result = await authService.forgotPassword(req.body.email);
        res.json(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: message });
      }
    },

    async resetPassword(req: Request, res: Response): Promise<void> {
      try {
        const result = await authService.resetPassword(req.body.token, req.body.newPassword);
        res.json(result);
      } catch (err) {
        if (err instanceof InvalidTokenError) {
          res.status(400).json({ error: err.message });
          return;
        }
        const message = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: message });
      }
    },
  };
}

export type AuthController = ReturnType<typeof createAuthController>;
