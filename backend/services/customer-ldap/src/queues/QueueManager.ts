import { Queue, Worker, type ConnectionOptions } from 'bullmq';
import { type FastifyInstance } from 'fastify';
import { QUEUE_NAMES, JOB_OPTIONS, WORKER_OPTIONS } from './config';
import {
  type InstanceCreatedJobData,
  type InstanceDeletedJobData,
  type InstanceUpdatedJobData,
  type InstanceRestoredJobData,
} from './types';
import { processInstanceCreated } from './processors/instanceCreatedProcessor';
import { processInstanceDeleted } from './processors/instanceDeletedProcessor';
import { processInstanceUpdated } from './processors/instanceUpdatedProcessor';
import { processInstanceRestored } from './processors/instanceRestoredProcessor';
import { createRedisConnection } from './connection';

export class QueueManager {
  private instanceCreatedQueue: Queue<InstanceCreatedJobData>;
  private instanceDeletedQueue: Queue<InstanceDeletedJobData>;
  private instanceUpdatedQueue: Queue<InstanceUpdatedJobData>;
  private instanceRestoredQueue: Queue<InstanceRestoredJobData>;
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

    this.instanceUpdatedQueue = new Queue<InstanceUpdatedJobData>(QUEUE_NAMES.INSTANCE_UPDATED, {
      connection: this.connection,
    });

    this.instanceRestoredQueue = new Queue<InstanceRestoredJobData>(QUEUE_NAMES.INSTANCE_RESTORED, {
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

    // Worker for instance updated events
    const instanceUpdatedWorker = new Worker<InstanceUpdatedJobData>(
      QUEUE_NAMES.INSTANCE_UPDATED,
      async (job) => {
        return processInstanceUpdated(job, this.fastify);
      },
      {
        ...WORKER_OPTIONS,
        connection: this.connection,
      },
    );

    // Worker for instance restored events
    const instanceRestoredWorker = new Worker<InstanceRestoredJobData>(
      QUEUE_NAMES.INSTANCE_RESTORED,
      async (job) => {
        return processInstanceRestored(job, this.fastify);
      },
      {
        ...WORKER_OPTIONS,
        connection: this.connection,
      },
    );

    // Set up worker event handlers
    this.setupWorkerEvents(instanceCreatedWorker, 'instance-created');
    this.setupWorkerEvents(instanceDeletedWorker, 'instance-deleted');
    this.setupWorkerEvents(instanceUpdatedWorker, 'instance-updated');
    this.setupWorkerEvents(instanceRestoredWorker, 'instance-restored');

    this.workers.push(instanceCreatedWorker, instanceDeletedWorker, instanceUpdatedWorker, instanceRestoredWorker);

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
   * Add instance updated job to queue
   */
  async addInstanceUpdatedJob(data: Omit<InstanceUpdatedJobData, 'timestamp'>): Promise<string> {
    const job = await this.instanceUpdatedQueue.add(
      'instance-updated',
      {
        ...data,
        timestamp: Date.now(),
      },
      JOB_OPTIONS,
    );

    this.fastify.log.info({ jobId: job.id, instanceId: data.instanceId }, 'Instance updated job added to queue');
    return job.id!;
  }

  /**
   * Add instance restored job to queue
   */
  async addInstanceRestoredJob(data: Omit<InstanceRestoredJobData, 'timestamp'>): Promise<string> {
    const job = await this.instanceRestoredQueue.add(
      'instance-restored',
      {
        ...data,
        timestamp: Date.now(),
      },
      JOB_OPTIONS,
    );

    this.fastify.log.info({ jobId: job.id, instanceId: data.instanceId }, 'Instance restored job added to queue');
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
    return [this.instanceCreatedQueue, this.instanceDeletedQueue, this.instanceUpdatedQueue, this.instanceRestoredQueue];
  }

  /**
   * Get job counts for all queues (waiting, active, completed, failed, delayed)
   */
  async getJobCounts(): Promise<
    Array<{
      name: string;
      waiting: number;
      active: number;
      completed: number;
      failed: number;
      delayed: number;
    }>
  > {
    const queues = this.getQueues();
    return Promise.all(
      queues.map(async (queue) => {
        try {
          const counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
          return {
            name: queue.name,
            waiting: counts.waiting ?? 0,
            active: counts.active ?? 0,
            completed: counts.completed ?? 0,
            failed: counts.failed ?? 0,
            delayed: counts.delayed ?? 0,
          };
        } catch (error) {
          this.fastify.log.error({ error, queue: queue.name }, 'Failed to fetch queue job counts');
          return {
            name: queue.name,
            waiting: 0,
            active: 0,
            completed: 0,
            failed: 0,
            delayed: 0,
          };
        }
      }),
    );
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
    await this.instanceUpdatedQueue.close();
    await this.instanceRestoredQueue.close();

    // Close Redis connection
    if (this.connection && typeof (this.connection as any).quit === 'function') {
      await (this.connection as any).quit();
    }

    this.fastify.log.info('Queue workers and connections closed');
  }
}
