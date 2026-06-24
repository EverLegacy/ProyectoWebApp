import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  ActivityLog,
  UserSession,
  StoreAnalytics,
  RewardCatalog,
} from './index';


let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});


afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});


describe('ActivityLog — validación de schema', () => {
  it('crea documento con campos requeridos (userId, action)', async () => {
    const doc = await ActivityLog.create({ userId: 1, action: 'login' });

    expect(doc._id).toBeDefined();
    expect(doc.userId).toBe(1);
    expect(doc.action).toBe('login');
    expect(doc.createdAt).toBeInstanceOf(Date);
  });

  it('campo metadata es opcional — documento válido sin él', async () => {
    const doc = await ActivityLog.create({ userId: 2, action: 'logout' });
    expect(doc.metadata).toBeUndefined();
  });

  it('campo metadata acepta objetos arbitrarios (Mixed)', async () => {
    const doc = await ActivityLog.create({
      userId: 3,
      action: 'redeem',
      metadata: { rewardId: 42, points: 100, store: 'OXXO' },
    });

    expect(doc.metadata).toMatchObject({ rewardId: 42, points: 100 });
  });

  it('falla al crear sin userId (campo requerido)', async () => {
    await expect(
      ActivityLog.create({ action: 'login' }),
    ).rejects.toThrow();
  });

  it('falla al crear sin action (campo requerido)', async () => {
    await expect(
      ActivityLog.create({ userId: 1 }),
    ).rejects.toThrow();
  });
});


describe('UserSession — campos opcionales y TTL', () => {
  it('crea sesión con campos requeridos', async () => {
    const expiresAt = new Date(Date.now() + 3600_000);
    const doc = await UserSession.create({
      userId: 1,
      token: 'jwt-abc-123',
      expiresAt,
    });

    expect(doc.userId).toBe(1);
    expect(doc.token).toBe('jwt-abc-123');
    expect(doc.expiresAt).toEqual(expiresAt);
  });

  it('campos device e ip son opcionales', async () => {
    const doc = await UserSession.create({
      userId: 2,
      token: 'jwt-xyz',
      expiresAt: new Date(Date.now() + 3600_000),
    });

    expect(doc.device).toBeUndefined();
    expect(doc.ip).toBeUndefined();
  });

  it('acepta device e ip cuando se proveen', async () => {
    const doc = await UserSession.create({
      userId: 3,
      token: 'jwt-with-meta',
      device: 'iPhone 15',
      ip: '192.168.1.1',
      expiresAt: new Date(Date.now() + 3600_000),
    });

    expect(doc.device).toBe('iPhone 15');
    expect(doc.ip).toBe('192.168.1.1');
  });

  it('ÍTEM TTL — expiresAt en el pasado es válido en schema (TTL lo limpia el índice)', async () => {
  
    const pastDate = new Date(Date.now() - 1000);
    const doc = await UserSession.create({
      userId: 4,
      token: 'expired-token',
      expiresAt: pastDate,
    });

    expect(doc.expiresAt.getTime()).toBeLessThan(Date.now());
  });

  it('colecciones limpias entre tests — no quedan sesiones previas', async () => {
    const count = await UserSession.countDocuments();
    expect(count).toBe(0);
  });
});



describe('RewardCatalog — arrays anidados', () => {
  it('crea catálogo con array de tags', async () => {
    const doc = await RewardCatalog.create({
      rewardId: 10,
      imageUrl: 'https://cdn.example.com/snack.png',
      tags: ['snack', 'bebida', 'popular'],
    });

    expect(doc.tags).toHaveLength(3);
    expect(doc.tags).toContain('snack');
  });

  it('tags es opcional — documento válido sin él', async () => {
    const doc = await RewardCatalog.create({ rewardId: 11 });
    expect(doc.tags).toBeDefined();
    expect(doc.tags?.length).toBe(0);
  });

  it('filtra documentos por tag específico', async () => {
    await RewardCatalog.create({ rewardId: 20, tags: ['premium'] });
    await RewardCatalog.create({ rewardId: 21, tags: ['básico', 'popular'] });
    await RewardCatalog.create({ rewardId: 22, tags: ['popular'] });

    const populares = await RewardCatalog.find({ tags: 'popular' });
    expect(populares).toHaveLength(2);
    expect(populares.map((d) => d.rewardId)).toEqual(expect.arrayContaining([21, 22]));
  });
});


describe('StoreAnalytics — schema numérico', () => {
  it('valores por defecto son 0', async () => {
    const doc = await StoreAnalytics.create({ storeId: 1, date: '2025-06-01' });

    expect(doc.totalSales).toBe(0);
    expect(doc.pointsIssued).toBe(0);
    expect(doc.scanCount).toBe(0);
  });

  it('acumula métricas correctamente', async () => {
    const doc = await StoreAnalytics.create({
      storeId: 2,
      date: '2025-06-01',
      totalSales: 5000,
      pointsIssued: 500,
      scanCount: 10,
    });

    expect(doc.totalSales).toBe(5000);
    expect(doc.pointsIssued).toBe(500);
    expect(doc.scanCount).toBe(10);
  });

  it('múltiples registros por tienda en fechas distintas', async () => {
    await StoreAnalytics.create({ storeId: 3, date: '2025-06-01', totalSales: 1000 });
    await StoreAnalytics.create({ storeId: 3, date: '2025-06-02', totalSales: 2000 });

    const docs = await StoreAnalytics.find({ storeId: 3 });
    const total = docs.reduce((sum, d) => sum + d.totalSales, 0);
    expect(total).toBe(3000);
  });
});
