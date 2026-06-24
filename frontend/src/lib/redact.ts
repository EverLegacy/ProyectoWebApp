const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'authorization',
  'email',
  'name',
  'code',
]);

export function redactClientData(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    result[key] = SENSITIVE_KEYS.has(key.toLowerCase()) ? '[REDACTED]' : value;
  }
  return result;
}
