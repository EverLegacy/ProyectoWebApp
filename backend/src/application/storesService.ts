import type { StoreRepository } from '../infrastructure/repositories';
import { logInfo } from '../logger/logger';

export class StoresService {
  constructor(private readonly storeRepo: StoreRepository) {}

  async listStores() {
    const stores = await this.storeRepo.listAll();
    logInfo('stores_listed', { count: stores.length });
    return stores;
  }
}
