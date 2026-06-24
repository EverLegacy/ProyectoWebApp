import mongoose from 'mongoose';
import { logInfo, logError, logDebug } from '../logger/logger';
import { redactObject } from '../logger/redact';

export async function connectMongo(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    logError('mongo_uri_missing');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    logInfo('mongodb_connected');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logError('mongodb_connection_error', { message });
    process.exit(1);
  }
}

if (process.env.MONGO_DEBUG === 'true') {
  mongoose.set('debug', (collection, method, query) => {
    logDebug('mongo_query', {
      type: 'mongo_query',
      collection,
      method,
      query: redactObject(query as Record<string, unknown>),
    });
  });
}
