import type { Request, Response, NextFunction } from 'express';
import { logInfo, logWarn } from '../logger/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - start;
    const meta = {
      type: 'http_request',
      correlationId: req.correlationId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
    };

    if (res.statusCode >= 500) {
      logWarn('http_request_server_error', meta);
    } else if (res.statusCode >= 400) {
      logWarn('http_request_client_error', meta);
    } else {
      logInfo('http_request', meta);
    }
  });

  next();
}
