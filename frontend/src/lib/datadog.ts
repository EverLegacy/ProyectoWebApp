import { redactClientData } from './redact';
import { datadogLogs } from '@datadog/browser-logs';

const CORRELATION_KEY = 'correlationId';


datadogLogs.init({
  clientToken: 'pub49dddb98225c47d1b0e641aa046a3a48',
  site: 'us5.datadoghq.com',
  forwardErrorsToLogs: true,
  sessionSampleRate: 100,
  forwardConsoleLogs: ['info', 'warn', 'error'], // 👈 IMPORTANTE
});

console.log('DATADOG INICIADO');

datadogLogs.logger.info('TEST_DATADOG', {
  source: 'frontend-init',
});


export function getOrCreateCorrelationId(): string {
  try {
    if (typeof window === 'undefined') {
      return 'no-window';
    }

    let id = sessionStorage.getItem(CORRELATION_KEY);

    if (!id) {
      id =
        (crypto?.randomUUID && crypto.randomUUID()) ||
        `fallback-${Date.now()}-${Math.random()}`;

      sessionStorage.setItem(CORRELATION_KEY, id);
    }

    return id;
  } catch {
    return `fallback-${Date.now()}`;
  }
}


function baseLog(
  level: 'info' | 'warn' | 'error' | 'debug',
  event: string,
  data?: Record<string, unknown>
) {
  const correlationId = getOrCreateCorrelationId();
  const safeData = data ? redactClientData(data) : {};

  const payload = {
    correlationId,
    ...safeData,
    env: import.meta.env.MODE,
  };

  datadogLogs.logger[level](event, payload);
}



export const logEvent = (event: string, data?: Record<string, unknown>) =>
  baseLog('info', event, data);

export const logWarn = (event: string, data?: Record<string, unknown>) =>
  baseLog('warn', event, data);

export const logError = (event: string, data?: Record<string, unknown>) =>
  baseLog('error', event, data);

export const logDebug = (event: string, data?: Record<string, unknown>) => {
  if (import.meta.env.DEV) {
    baseLog('debug', event, data);
  }
};