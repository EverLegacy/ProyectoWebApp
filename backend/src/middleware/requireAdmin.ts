import type { Request, Response, NextFunction } from 'express';
import { logWarn } from '../logger/logger';

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    logWarn('admin_access_denied', {
      correlationId: req.correlationId,
      userId: req.user?.id,
    });
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}
