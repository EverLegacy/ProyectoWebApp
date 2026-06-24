/** Política de retención de logs — hot 30 días, cold 90 días (DevOps). */
export const LOG_RETENTION = {
  hotDays: 30,
  coldDays: 90,
  description:
    'Logs hot en Datadog/agregador 30 días; archivado cold 90 días. Configurar en panel DevOps.',
} as const;

/** Destino de shipping de logs (stdout → agente Datadog/CloudWatch en producción). */
export const LOG_SHIPPING = {
  backend: 'stdout JSON → Datadog Agent / CloudWatch Logs',
  frontend: 'Datadog Browser Logs (us5.datadoghq.com)',
} as const;
