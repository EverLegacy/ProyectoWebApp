import 'dotenv/config';

import tracer from 'dd-trace';

tracer.init({
  service: 'loyalty-app-api',
  env: process.env.NODE_ENV ?? 'dev',
  logInjection: true,
});

import { createApp } from './app';
import { connectPostgres } from './infrastructure/postgres';
import { connectMongo } from './infrastructure/mongo';
import { logInfo } from './logger/logger';

const PORT = Number(process.env.PORT ?? 3000);

async function bootstrap(): Promise<void> {
  await connectPostgres();
  await connectMongo();

  const app = createApp();

  app.listen(PORT, () => {
    logInfo('server_started', { port: PORT, env: process.env.NODE_ENV ?? 'dev' });
  });
}

void bootstrap();
