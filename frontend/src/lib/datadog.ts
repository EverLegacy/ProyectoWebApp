import { datadogLogs } from '@datadog/browser-logs';

datadogLogs.init({
  clientToken: 'pub49dddb98225c47d1b0e641aa046a3a48',
  site: 'datadoghq.com',
  forwardErrorsToLogs: true,
  sessionSampleRate: 100
});

console.log('DATADOG INICIADO');

datadogLogs.logger.info('TEST_DATADOG');

export const logEvent = (
  event: string,
  data?: Record<string, unknown>
) => {
  datadogLogs.logger.info(event, data);
};