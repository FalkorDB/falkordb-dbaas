import { setupApp } from './app';
import { setupContainer } from './container';
import logger from './logger';
import { setupWorkers, shutdownWorkers } from './workers/workers';

logger.info('Starting DB Importer Worker...');

export async function start() {
  setupContainer();
  setupWorkers();
  setupApp();
}

start().catch((error) => {
  logger.error({ error }, 'Failed to start server');
  process.exit(1);
});

// process sigterm
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await shutdownWorkers();
  process.exit(0);
});
