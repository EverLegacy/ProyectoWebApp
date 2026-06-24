import winston from 'winston';
import Transport from 'winston-transport';
import { redactObject } from './redact';

const SENSITIVE_TOP_LEVEL_KEYS = new Set([
  'password',
  'password_hash',
  'token',
  'authorization',
  'email',
  'name',
  'secret',
]);

const redactFormat = winston.format((info) => {
  for (const key of Object.keys(info)) {
    if (key === 'level' || key === 'message' || key === 'timestamp') continue;

    const value = info[key];
    if (SENSITIVE_TOP_LEVEL_KEYS.has(key.toLowerCase())) {
      info[key] = '[REDACTED]';
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      info[key] = redactObject(value as Record<string, unknown>);
    }
  }
  return info;
});

class DatadogHttpTransport extends Transport {
  constructor(
    private readonly apiKey: string,
    private readonly site: string,
    private readonly service: string,
  ) {
    super();
  }

  log(info: winston.Logform.TransformableInfo, callback: () => void): void {
    setImmediate(() => this.emit('logged', info));

    const { level, message, timestamp, ...rest } = info;
    const payload = [
      {
        message: String(message),
        service: this.service,
        ddsource: 'nodejs',
        hostname: 'loyalty-app-backend',
        status: level,
        timestamp: timestamp ?? new Date().toISOString(),
        ...rest,
      },
    ];

    const url = `https://http-intake.logs.${this.site}/api/v2/logs`;

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'DD-API-KEY': this.apiKey,
      },
      body: JSON.stringify(payload),
    }).catch(() => {
      // No interrumpir la app si Datadog no responde
    });

    callback();
  }
}

const logLevel = process.env.LOG_LEVEL ?? 'info';
const serviceName = process.env.DD_SERVICE ?? 'loyalty-app-api';
const isDev = process.env.NODE_ENV !== 'production';
const usePretty =
  process.env.LOG_FORMAT === 'pretty' || (isDev && process.env.LOG_FORMAT !== 'json');

const jsonLineFormat = winston.format.combine(
  winston.format.timestamp(),
  redactFormat(),
  winston.format.json(),
);

const prettyFormat = winston.format.combine(
  winston.format.timestamp(),
  redactFormat(),
  winston.format.colorize(),
  winston.format.printf((info) => {
    const { level, message, timestamp, ...rest } = info;
    const metaKeys = Object.keys(rest).filter((k) => k !== 'service');
    const meta =
      metaKeys.length > 0
        ? ` ${JSON.stringify(redactObject(rest as Record<string, unknown>))}`
        : '';
    return `${timestamp} ${level}: ${message}${meta}`;
  }),
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: usePretty ? prettyFormat : jsonLineFormat,
  }),
];

const ddApiKey = process.env.DD_API_KEY;
const ddSite = process.env.DD_SITE ?? 'us5.datadoghq.com';

if (ddApiKey) {
  transports.push(new DatadogHttpTransport(ddApiKey, ddSite, serviceName));
}

export const logger = winston.createLogger({
  level: logLevel,
  levels: winston.config.npm.levels,
  format: jsonLineFormat,
  transports,
  defaultMeta: { service: serviceName },
});

export function createChildLogger(meta: Record<string, unknown>): winston.Logger {
  return logger.child(redactObject(meta));
}

export function logDebug(message: string, meta?: Record<string, unknown>): void {
  logger.debug({ message, ...(meta ? redactObject(meta) : {}) });
}

export function logInfo(message: string, meta?: Record<string, unknown>): void {
  logger.info({ message, ...(meta ? redactObject(meta) : {}) });
}

export function logWarn(message: string, meta?: Record<string, unknown>): void {
  logger.warn({ message, ...(meta ? redactObject(meta) : {}) });
}

export function logError(message: string, meta?: Record<string, unknown>): void {
  logger.error({ message, ...(meta ? redactObject(meta) : {}) });
}
