import { describe, it, expect, vi } from 'vitest';
import { StoresService } from './storesService';
import type { StoreRepository } from '../infrastructure/repositories';

describe('StoresService', () => {
  describe('listStores', () => {
    describe('cuando hay tiendas registradas', () => {
      it('debe retornar la lista de tiendas', async () => {
        // Arrange
        const storeRepo = {
          listAll: vi.fn().mockResolvedValue([{ id: 1, name: 'OXXO Centro' }]),
        } as unknown as StoreRepository;
        const service = new StoresService(storeRepo);

        // Act
        const result = await service.listStores();

        // Assert
        expect(result).toHaveLength(1);
      });
    });
  });
});
