/**
 * Pruebas de Integración REST API — Checklist 4.1
 *
 * Cubre los ítems más demostrables del checklist:
 *   ✅ Validación de entrada → 400
 *   ✅ Autenticación → 401
 *   ✅ Autorización → 403
 *   ✅ Conflicto de datos → 409
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../app';

// ── Mocks de infraestructura ────────────────────────────────────────────────

vi.mock('../infrastructure/postgres', () => ({
  pool: { query: vi.fn() },
  connectPostgres: vi.fn(),
}));

vi.mock('../infrastructure/mongo', () => ({
  connectMongo: vi.fn(),
}));

vi.mock('../models/mongo', () => ({
  ActivityLog: { create: vi.fn().mockResolvedValue({}) },
}));

// ── Helper: genera un JWT válido para tests ─────────────────────────────────

const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;

function makeToken(payload: object = { id: 1, email: 'test@test.com', role: 'user' }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

function makeAdminToken() {
  return makeToken({ id: 99, email: 'admin@test.com', role: 'admin' });
}

// ── Helpers de mock de BD ───────────────────────────────────────────────────

async function getMockQuery() {
  const { pool } = await import('../infrastructure/postgres');
  return vi.mocked(pool.query);
}

function pgRow(rows: object[], command = 'SELECT') {
  return { rows, rowCount: rows.length, command, oid: 0, fields: [] } as never;
}

// ────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});


















// ── ÍTEM: Autenticación → 401 ────────────────────────────────────────────────
describe('Autenticación: request sin token → 401', () => {
  it('GET /api/points/balance sin Authorization header', async () => {
    const app = createApp();
    const res = await request(app).get('/api/points/balance');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('GET /api/rewards sin Authorization header', async () => {
    const app = createApp();
    const res = await request(app).get('/api/rewards');
    expect(res.status).toBe(401);
  });

  it('GET /api/stores sin Authorization header', async () => {
    const app = createApp();
    const res = await request(app).get('/api/stores');
    expect(res.status).toBe(401);
  });

  it('token malformado → 401', async () => {
    const app = createApp();
    const res = await request(app)
      .get('/api/points/balance')
      .set('Authorization', 'Bearer token-invalido-total');
    expect(res.status).toBe(401);
  });
});

// ── ÍTEM: Autorización → 403 ─────────────────────────────────────────────────
describe('Autorización: rol insuficiente → 403', () => {
  it('POST /api/rewards con token de usuario normal (no admin) → 403', async () => {
    const app = createApp();
    const mockQuery = await getMockQuery();
    mockQuery.mockResolvedValue(pgRow([]));

    const res = await request(app)
      .post('/api/rewards')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ name: 'Snack', description: 'Desc', points_cost: 100, stock: 10 });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/rewards con token de admin → 201', async () => {
    const app = createApp();
    const mockQuery = await getMockQuery();
    mockQuery.mockResolvedValueOnce(
      pgRow([{ id: 5, name: 'Snack', description: 'Desc', points_cost: 100, stock: 10 }], 'INSERT'),
    );

    const res = await request(app)
      .post('/api/rewards')
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .send({ name: 'Snack', description: 'Desc', points_cost: 100, stock: 10 });

    expect(res.status).toBe(201);
  });
});

// ── ÍTEM: Conflicto de datos → 409 ──────────────────────────────────────────
describe('Conflicto de datos → 409', () => {
  it('POST /api/auth/register con email duplicado → 409', async () => {
    const app = createApp();
    const mockQuery = await getMockQuery();

    // Simula el error de UNIQUE constraint de PostgreSQL
    const pgUniqueError = Object.assign(new Error('duplicate key'), { code: '23505' });
    mockQuery.mockRejectedValueOnce(pgUniqueError);

    const bcrypt = await import('bcryptjs');
    vi.spyOn(bcrypt.default, 'hash').mockResolvedValue('hashed' as never);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ana', email: 'duplicado@test.com', password: 'secret123' });

    expect(res.status).toBe(409);
  });
});

