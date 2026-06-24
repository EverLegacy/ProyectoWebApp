import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

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

describe('API REST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('debe retornar status ok', async () => {
      // Arrange
      const app = createApp();

      // Act
      const response = await request(app).get('/api/health');

      // Assert
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/auth/register', () => {
    it('debe retornar 201 cuando el registro es exitoso', async () => {
      // Arrange
      const app = createApp();
      const { pool } = await import('../infrastructure/postgres');
      const mockQuery = vi.mocked(pool.query);
      mockQuery
        .mockResolvedValueOnce({
          rows: [{ id: 1, name: 'Test', email: 'test@example.com' }],
          rowCount: 1,
          command: 'INSERT',
          oid: 0,
          fields: [],
        } as never)
        .mockResolvedValueOnce({
          rows: [],
          rowCount: 1,
          command: 'INSERT',
          oid: 0,
          fields: [],
        } as never);

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test@example.com', password: 'secret123' });

      // Assert
      expect(response.status).toBe(201);
    });
  });

  describe('POST /api/auth/login', () => {
    it('debe retornar 401 con credenciales inválidas', async () => {
      // Arrange
      const app = createApp();
      const { pool } = await import('../infrastructure/postgres');
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as never);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'x@y.com', password: 'wrong' });

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/points/balance', () => {
    it('debe retornar 401 sin token', async () => {
      // Arrange
      const app = createApp();

      // Act
      const response = await request(app).get('/api/points/balance');

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('correlation ID', () => {
    it('debe incluir X-Correlation-ID en la respuesta', async () => {
      // Arrange
      const app = createApp();

      // Act
      const response = await request(app)
        .get('/api/health')
        .set('X-Correlation-ID', 'test-correlation-123');

      // Assert
      expect(response.headers['x-correlation-id']).toBe('test-correlation-123');
    });
  });
});
