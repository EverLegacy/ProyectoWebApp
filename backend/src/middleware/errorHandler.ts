import type { Request, Response, NextFunction } from 'express';
import { logError } from '../logger/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logError('unhandled_error', {
    type: 'error',
    correlationId: req.correlationId,
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(500).json({
    message: 'Internal server error',
    correlationId: req.correlationId,
  });
}
