import type { Request, Response } from 'express';
import { StoresService } from '../application/storesService';

export function createStoresController(storesService: StoresService) {
  return {
    async listStores(_req: Request, res: Response): Promise<void> {
      try {
        const stores = await storesService.listStores();
        res.json(stores);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: message });
      }
    },
  };
}

export type StoresController = ReturnType<typeof createStoresController>;
