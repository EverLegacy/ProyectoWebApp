import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { logDebug } from '../logger/logger';

export const CORRELATION_HEADER = 'x-correlation-id';

export function correlationId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.headers[CORRELATION_HEADER];
  const id = typeof incoming === 'string' && incoming.length > 0 ? incoming : randomUUID();

  req.correlationId = id;
  res.setHeader('X-Correlation-ID', id);

  logDebug('correlation_id_assigned', { correlationId: id, method: req.method, path: req.path });

  next();
}
