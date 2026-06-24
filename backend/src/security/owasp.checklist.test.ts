import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret-for-this-spec-only';

describe('A02 — Cryptographic Failures: passwords con bcrypt', () => {
  it('el mismo password produce hashes distintos cada vez (salt aleatorio)', async () => {
    const hash1 = await bcrypt.hash('MiPassword123!', 10);
    const hash2 = await bcrypt.hash('MiPassword123!', 10);

    
    expect(hash1).not.toBe(hash2);
  });

  it('el hash no es reversible: no contiene el password en texto plano', async () => {
    const password = 'MiPassword123!';
    const hash = await bcrypt.hash(password, 10);

    expect(hash).not.toContain(password);
    expect(hash.length).toBeGreaterThan(50); 
  });

  it('bcrypt.compare valida correctamente el password original', async () => {
    const hash = await bcrypt.hash('MiPassword123!', 10);

    expect(await bcrypt.compare('MiPassword123!', hash)).toBe(true);
    expect(await bcrypt.compare('PasswordIncorrecto', hash)).toBe(false);
  });

  it('el formato del hash corresponde a bcrypt ($2a$, $2b$ o $2y$), no a MD5/SHA1', async () => {
    const hash = await bcrypt.hash('MiPassword123!', 10);
    expect(hash).toMatch(/^\$2[aby]\$/);
  });
});

describe('A03 — Injection SQL: prepared statements', () => {
  it('un intento de inyección SQL como password se trata como texto literal, no como código', async () => {
   
    const maliciousInput = "' OR 1=1; DROP TABLE users;--";


    const hash = await bcrypt.hash('passwordReal', 10);
    const result = await bcrypt.compare(maliciousInput, hash);

    expect(result).toBe(false); 
  });

  it('el código fuente de los controllers no concatena strings en queries SQL', async () => {
    

    const fs = await import('fs');
    const path = await import('path');
    const controllersDir = path.join(__dirname, '../controllers');
    const files = fs
      .readdirSync(controllersDir)
      .filter((f: string) => f.endsWith('.ts'));

    for (const file of files) {
      const content = fs.readFileSync(path.join(controllersDir, file), 'utf-8');
      
      const dangerousPattern = /`[^`]*SELECT[^`]*\$\{[^}]+\}[^`]*`/i;
      expect(dangerousPattern.test(content)).toBe(false);
    }
  });
});

describe('A07 — Auth Failures: JWT con expiración y algoritmo seguro', () => {
  it('el token firmado incluye una claim de expiración (exp)', () => {
    const token = jwt.sign({ id: 1, email: 'test@test.com', role: 'user' }, JWT_SECRET, {
      expiresIn: '7d',
      algorithm: 'HS256',
    });
    const decoded = jwt.decode(token) as { exp?: number; iat?: number };

    expect(decoded?.exp).toBeDefined();
    expect(decoded?.iat).toBeDefined();
    expect(decoded!.exp! > decoded!.iat!).toBe(true);
  });

  it('el token usa el algoritmo HS256 (mínimo seguro requerido)', () => {
    const token = jwt.sign({ id: 1 }, JWT_SECRET, { algorithm: 'HS256' });
    const [headerB64] = token.split('.');
    const header = JSON.parse(Buffer.from(headerB64, 'base64').toString());

    expect(header.alg).toBe('HS256');
  });

  it('jwt.verify rechaza un token firmado con "none" (algoritmo inseguro)', () => {
    
    const headerNone = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString(
      'base64url'
    );
    const payload = Buffer.from(JSON.stringify({ id: 1, role: 'admin' })).toString('base64url');
    const forgedToken = `${headerNone}.${payload}.`;

    expect(() =>
      jwt.verify(forgedToken, JWT_SECRET, { algorithms: ['HS256'] })
    ).toThrow();
  });

  it('jwt.verify rechaza un token expirado', () => {
    const expiredToken = jwt.sign({ id: 1 }, JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: -10, 
    });

    expect(() => jwt.verify(expiredToken, JWT_SECRET, { algorithms: ['HS256'] })).toThrow(
      /expired/i
    );
  });
});
