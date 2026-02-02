import { Queue, Worker, type ConnectionOptions } from 'bullmq';
import { type FastifyInstance } from 'fastify';
import { QUEUE_NAMES, JOB_OPTIONS, WORKER_OPTIONS } from './config';
import { type InstanceCreatedJobData, type InstanceDeletedJobData } from './types';
import { processInstanceCreated } from './processors/instanceCreatedProcessor';
import { processInstanceDeleted } from './processors/instanceDeletedProcessor';
import { createRedisConnection } from './connection';

export class QueueManager {
  private instanceCreatedQueue: Queue<InstanceCreatedJobData>;
  private instanceDeletedQueue: Queue<InstanceDeletedJobData>;
  private workers: Worker[] = [];
  private connection: ConnectionOptions;

  constructor(private fastify: FastifyInstance) {
    // Create Redis connection
    const redis = createRedisConnection(fastify.config);
    this.connection = redis;

    // Initialize queues
    this.instanceCreatedQueue = new Queue<InstanceCreatedJobData>(QUEUE_NAMES.INSTANCE_CREATED, {
      connection: this.connection,
    });

    this.instanceDeletedQueue = new Queue<InstanceDeletedJobData>(QUEUE_NAMES.INSTANCE_DELETED, {
      connection: this.connection,
    });

    fastify.log.info('Queues initialized');
  }

  /**
   * Start workers to process jobs
   */
  async startWorkers(): Promise<void> {
    // Worker for instance created events
    const instanceCreatedWorker = new Worker<InstanceCreatedJobData>(
      QUEUE_NAMES.INSTANCE_CREATED,
      async (job) => {
        return processInstanceCreated(job, this.fastify);
      },
      {
        ...WORKER_OPTIONS,
        connection: this.connection,
      },
    );

    // Worker for instance deleted events
    const instanceDeletedWorker = new Worker<InstanceDeletedJobData>(
      QUEUE_NAMES.INSTANCE_DELETED,
      async (job) => {
        return processInstanceDeleted(job, this.fastify);
      },
      {
        ...WORKER_OPTIONS,
        connection: this.connection,
      },
    );

    // Set up worker event handlers
    this.setupWorkerEvents(instanceCreatedWorker, 'instance-created');
    this.setupWorkerEvents(instanceDeletedWorker, 'instance-deleted');

    this.workers.push(instanceCreatedWorker, instanceDeletedWorker);

    this.fastify.log.info('Queue workers started');
  }

  /**
   * Add instance created job to queue
   */
  async addInstanceCreatedJob(data: Omit<InstanceCreatedJobData, 'timestamp'>): Promise<string> {
    const job = await this.instanceCreatedQueue.add(
      'instance-created',
      {
        ...data,
        timestamp: Date.now(),
      },
      JOB_OPTIONS,
    );

    this.fastify.log.info({ jobId: job.id, instanceId: data.instanceId }, 'Instance created job added to queue');
    return job.id!;
  }

  /**
   * Add instance deleted job to queue
   */
  async addInstanceDeletedJob(data: Omit<InstanceDeletedJobData, 'timestamp'>): Promise<string> {
    const job = await this.instanceDeletedQueue.add(
      'instance-deleted',
      {
        ...data,
        timestamp: Date.now(),
      },
      JOB_OPTIONS,
    );

    this.fastify.log.info({ jobId: job.id, instanceId: data.instanceId }, 'Instance deleted job added to queue');
    return job.id!;
  }

  /**
   * Set up event handlers for a worker
   */
  private setupWorkerEvents(worker: Worker, workerName: string): void {
    worker.on('completed', (job) => {
      this.fastify.log.info(
        {
          jobId: job.id,
          workerName,
          attemptsMade: job.attemptsMade,
        },
        'Job completed successfully',
      );
    });

    worker.on('failed', (job, err) => {
      this.fastify.log.error(
        {
          jobId: job?.id,
          workerName,
          attemptsMade: job?.attemptsMade,
          error: err.message,
        },
        'Job failed',
      );
    });

    worker.on('error', (err) => {
      this.fastify.log.error(
        {
          workerName,
          error: err.message,
        },
        'Worker error',
      );
    });
  }

  /**
   * Get all queues for monitoring (e.g., QueueDash)
   */
  getQueues(): Queue[] {
    return [this.instanceCreatedQueue, this.instanceDeletedQueue];
  }

  /**
   * Get Redis connection for monitoring (e.g., QueueDash)
   */
  getConnection(): ConnectionOptions {
    return this.connection;
  }

  /**
   * Close all workers and queues gracefully
   */
  async close(): Promise<void> {
    this.fastify.log.info('Closing queue workers and connections');

    // Close all workers
    await Promise.all(this.workers.map((worker) => worker.close()));

    // Close queues
    await this.instanceCreatedQueue.close();
    await this.instanceDeletedQueue.close();

    // Close Redis connection
    if (this.connection && typeof (this.connection as any).quit === 'function') {
      await (this.connection as any).quit();
    }

    this.fastify.log.info('Queue workers and connections closed');
  }
}
