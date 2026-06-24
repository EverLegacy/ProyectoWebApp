import { Router } from 'express';
import type { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  router.post('/register', (req, res) => void authController.register(req, res));
  router.post('/login', (req, res) => void authController.login(req, res));
  router.get('/me', authMiddleware, (req, res) => void authController.me(req, res));
  router.post('/forgot-password', (req, res) => void authController.forgotPassword(req, res));
  router.post('/reset-password', (req, res) => void authController.resetPassword(req, res));

  return router;
}
