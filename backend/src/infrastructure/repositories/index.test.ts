import { describe, it, expect, vi } from 'vitest';
import {
  UserRepository,
  LoyaltyCardRepository,
  RewardRepository,
  StoreRepository,
  TransactionRepository,
} from './index';
import type { Pool } from 'pg';

function createMockPool(rows: unknown[] = []): Pool {
  return {
    query: vi.fn().mockResolvedValue({ rows }),
  } as unknown as Pool;
}

describe('UserRepository', () => {
  describe('create', () => {
    describe('cuando se crea usuario', () => {
      it('debe retornar el usuario creado', async () => {
        // Arrange
        const repo = new UserRepository(
          createMockPool([{ id: 1, name: 'Test', email: 'a@b.com' }]),
        );

        // Act
        const result = await repo.create('Test', 'a@b.com', 'hash');

        // Assert
        expect(result.email).toBe('a@b.com');
      });
    });
  });

  describe('findByEmail', () => {
    describe('cuando el usuario no existe', () => {
      it('debe retornar null', async () => {
        // Arrange
        const repo = new UserRepository(createMockPool([]));

        // Act
        const result = await repo.findByEmail('missing@example.com');

        // Assert
        expect(result).toBeNull();
      });
    });

    describe('cuando el usuario existe', () => {
      it('debe retornar el usuario', async () => {
        // Arrange
        const repo = new UserRepository(
          createMockPool([{ id: 1, email: 'user@test.com', name: 'User' }]),
        );

        // Act
        const result = await repo.findByEmail('user@test.com');

        // Assert
        expect(result?.id).toBe(1);
      });
    });
  });
});

describe('LoyaltyCardRepository', () => {
  describe('addPoints', () => {
    describe('cuando se agregan puntos', () => {
      it('debe retornar nuevo balance', async () => {
        // Arrange
        const repo = new LoyaltyCardRepository(createMockPool([{ points_balance: 300 }]));

        // Act
        const result = await repo.addPoints(1, 100);

        // Assert
        expect(result).toBe(300);
      });
    });
  });

  describe('findByUserId', () => {
    describe('cuando existe tarjeta', () => {
      it('debe retornar la tarjeta', async () => {
        // Arrange
        const repo = new LoyaltyCardRepository(
          createMockPool([{ id: 1, points_balance: 100, card_number: 'CARD-1' }]),
        );

        // Act
        const result = await repo.findByUserId(1);

        // Assert
        expect(result?.points_balance).toBe(100);
      });
    });
  });
});

describe('RewardRepository', () => {
  describe('findById', () => {
    describe('cuando existe la recompensa', () => {
      it('debe retornar la recompensa', async () => {
        // Arrange
        const repo = new RewardRepository(
          createMockPool([{ id: 1, name: 'Snack', points_cost: 100, stock: 5 }]),
        );

        // Act
        const result = await repo.findById(1);

        // Assert
        expect(result?.name).toBe('Snack');
      });
    });
  });

  describe('listAvailable', () => {
    describe('cuando hay recompensas', () => {
      it('debe retornar la lista', async () => {
        // Arrange
        const repo = new RewardRepository(
          createMockPool([{ id: 1, name: 'Snack', points_cost: 100, stock: 5 }]),
        );

        // Act
        const result = await repo.listAvailable();

        // Assert
        expect(result).toHaveLength(1);
      });
    });
  });
});

describe('StoreRepository', () => {
  describe('listAll', () => {
    describe('cuando hay tiendas', () => {
      it('debe retornar tiendas ordenadas', async () => {
        // Arrange
        const repo = new StoreRepository(createMockPool([{ id: 1, name: 'OXXO' }]));

        // Act
        const result = await repo.listAll();

        // Assert
        expect(result[0].name).toBe('OXXO');
      });
    });
  });
});

describe('TransactionRepository', () => {
  describe('create', () => {
    describe('cuando se registra transacción', () => {
      it('debe ejecutar query sin error', async () => {
        // Arrange
        const pool = createMockPool([]);
        const repo = new TransactionRepository(pool);

        // Act & Assert
        await expect(repo.create(1, 2, 100, 100)).resolves.toBeUndefined();
      });
    });
  });
});
