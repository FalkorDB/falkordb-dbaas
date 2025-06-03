import { Queue, Worker } from 'bullmq';
import processors from '../processors';
import logger from '../logger';

export let workerError = false;

export const getQueues = () => {
  const queues = processors.map(({ name }) => new Queue(name, {
    connection: {
      url: process.env.REDIS_URL,
    },
  }));

  for (const q of queues) {
    q.on('error', (error) => {
      logger.error(`Queue ${q.name} error: ${error}`);
      workerError = true;
    });
  }

  return queues;
}

const workers: Worker[] = []
export const setupWorkers = () => {

  // Setup the workers
  for (const { name, processor, concurrency } of processors) {
    const w = new Worker(name, processor, {
      connection: {
        url: process.env.REDIS_URL,
      },
      concurrency: concurrency ?? process.env.WORKER_CONCURRENCY ? Number(process.env.WORKER_CONCURRENCY) : 1,
    });
    workers.push(w);

    logger.info(`Worker ${name} started with concurrency ${concurrency ?? process.env.WORKER_CONCURRENCY ?? 1}`);
  }

  for (const w of workers) {
    w.on('error', (error) => {
      logger.error(`Worker ${w.name} error: ${error}`);
      workerError = true;
    });
  }

}

export const shutdownWorkers = async () => {
  logger.info('Shutting down workers...');

  for (const w of workers) {
    try {
      await w.close();
      logger.info(`Worker ${w.name} closed successfully`);
    } catch (error) {
      logger.error(`Error closing worker ${w.name}: ${error}`);
    }
  }

  logger.info('All workers shut down');
}