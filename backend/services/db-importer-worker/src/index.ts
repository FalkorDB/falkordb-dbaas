import { setupApp } from './app';
import { setupContainer } from './container';
import logger from './logger';
import { setupWorkers } from './workers/workers';


logger.info('Starting DB Importer Worker...');

export async function start() {
  setupContainer();
  setupWorkers();
  setupApp();
}

start().catch((error) => {
  logger.error('Failed to start server', error);
  process.exit(1);
});
