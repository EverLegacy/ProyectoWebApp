import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from '../types/auth';
import { logWarn, logDebug } from '../logger/logger';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    logWarn('auth_missing_token', { correlationId: req.correlationId, path: req.path });
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const token = header.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    req.user = jwt.verify(token, secret, { algorithms: ['HS256'] }) as JwtPayload;
    logDebug('auth_success', { correlationId: req.correlationId, userId: req.user.id });
    next();
  } catch {
    logWarn('auth_invalid_token', { correlationId: req.correlationId, path: req.path });
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}