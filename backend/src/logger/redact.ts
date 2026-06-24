const SENSITIVE_KEYS = new Set([
  'password',
  'password_hash',
  'passwordHash',
  'token',
  'authorization',
  "resettoken",
  'secret',
  'jwt',
  'accesstoken',
  'refreshtoken',
  'creditcard',
  'ssn',
]);

const PII_KEYS = new Set(['email', 'name', 'phone', 'address', 'ip']);

function shouldRedactKey(key: string, includePii: boolean): boolean {
  const normalized = key.toLowerCase();
  if (SENSITIVE_KEYS.has(normalized)) return true;
  if (!includePii && PII_KEYS.has(normalized)) return true;
  return false;
}

export function redactValue(value: unknown, includePii = false): unknown {
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    if (value.startsWith('Bearer ')) return 'Bearer [REDACTED]';
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, includePii));
  }

  if (typeof value === 'object') {
    return redactObject(value as Record<string, unknown>, includePii);
  }

  return value;
}

export function redactObject(
  obj: Record<string, unknown>,
  includePii = false,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (shouldRedactKey(key, includePii)) {
      result[key] = '[REDACTED]';
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = redactObject(value as Record<string, unknown>, includePii);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => redactValue(item, includePii));
    } else {
      result[key] = value;
    }
  }

  return result;
}
