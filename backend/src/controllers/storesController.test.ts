import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { createStoresController } from './storesController';

function mockResponse(): Response {
  const res = {
    statusCode: 200,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
      return this;
    },
    body: undefined as unknown,
  };
  return res as unknown as Response;
}

describe('StoresController', () => {
  describe('listStores', () => {
    describe('cuando hay error', () => {
      it('debe responder 500', async () => {
        // Arrange
        const storesService = {
          listStores: vi.fn().mockRejectedValue(new Error('db error')),
        };
        const controller = createStoresController(storesService as never);
        const req = {} as Request;
        const res = mockResponse();

        // Act
        await controller.listStores(req, res);

        // Assert
        expect(res.statusCode).toBe(500);
      });
    });

    describe('cuando hay tiendas', () => {
      it('debe retornar la lista', async () => {
        // Arrange
        const storesService = {
          listStores: vi.fn().mockResolvedValue([{ id: 1, name: 'OXXO' }]),
        };
        const controller = createStoresController(storesService as never);
        const req = {} as Request;
        const res = mockResponse();

        // Act
        await controller.listStores(req, res);

        // Assert
        expect(res.statusCode).toBe(200);
      });
    });
  });
});
