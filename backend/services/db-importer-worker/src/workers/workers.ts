import { Queue, Worker } from 'bullmq';
import processors from '../processors';
import logger from '../logger';

export const getQueues = () => {
  return processors.map(({ name }) => new Queue(name));
}

export const setupWorkers = () => {

  // Setup the workers
  for (const { name, processor, concurrency } of processors) {
    new Worker(name, processor, {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        username: process.env.REDIS_USERNAME || 'default',
        password: process.env.REDIS_PASSWORD || 'default',
      },
      concurrency: concurrency ?? process.env.WORKER_CONCURRENCY ? Number(process.env.WORKER_CONCURRENCY) : 1,
    });

    logger.info(`Worker ${name} started with concurrency ${concurrency ?? process.env.WORKER_CONCURRENCY ?? 1}`);
  }

}