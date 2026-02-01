import { QueueManager } from '../../src/queues/QueueManager';
import { Queue, Worker } from 'bullmq';
import { FastifyInstance } from 'fastify';
import { QUEUE_NAMES, JOB_OPTIONS } from '../../src/queues/config';

// Mock BullMQ
jest.mock('bullmq');
jest.mock('../../src/queues/connection');

describe('QueueManager', () => {
  let queueManager: QueueManager;
  let mockFastify: FastifyInstance;
  let mockQueue: jest.Mocked<Queue>;
  let mockWorker: jest.Mocked<Worker>;

  beforeEach(() => {
    // Mock Fastify instance
    mockFastify = {
      config: {
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        REDIS_DB: 0,
      },
      log: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        child: jest.fn().mockReturnThis(),
      },
      diContainer: {
        resolve: jest.fn(),
      },
    } as any;

    // Mock Queue
    mockQueue = {
      add: jest.fn().mockResolvedValue({ id: 'test-job-id' }),
      close: jest.fn().mockResolvedValue(undefined),
    } as any;

    // Mock Worker
    mockWorker = {
      on: jest.fn().mockReturnThis(),
      close: jest.fn().mockResolvedValue(undefined),
    } as any;

    (Queue as jest.MockedClass<typeof Queue>).mockImplementation(() => mockQueue);
    (Worker as jest.MockedClass<typeof Worker>).mockImplementation(() => mockWorker);

    queueManager = new QueueManager(mockFastify);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize queues', () => {
      expect(Queue).toHaveBeenCalledTimes(2);
      expect(Queue).toHaveBeenCalledWith(QUEUE_NAMES.INSTANCE_CREATED, expect.any(Object));
      expect(Queue).toHaveBeenCalledWith(QUEUE_NAMES.INSTANCE_DELETED, expect.any(Object));
      expect(mockFastify.log.info).toHaveBeenCalledWith('Queues initialized');
    });
  });

  describe('startWorkers', () => {
    it('should start workers for both queues', async () => {
      await queueManager.startWorkers();

      expect(Worker).toHaveBeenCalledTimes(2);
      expect(Worker).toHaveBeenCalledWith(
        QUEUE_NAMES.INSTANCE_CREATED,
        expect.any(Function),
        expect.any(Object),
      );
      expect(Worker).toHaveBeenCalledWith(
        QUEUE_NAMES.INSTANCE_DELETED,
        expect.any(Function),
        expect.any(Object),
      );
      expect(mockFastify.log.info).toHaveBeenCalledWith('Queue workers started');
    });

    it('should set up event handlers for workers', async () => {
      await queueManager.startWorkers();

      expect(mockWorker.on).toHaveBeenCalledWith('completed', expect.any(Function));
      expect(mockWorker.on).toHaveBeenCalledWith('failed', expect.any(Function));
      expect(mockWorker.on).toHaveBeenCalledWith('error', expect.any(Function));
    });
  });

  describe('addInstanceCreatedJob', () => {
    beforeEach(async () => {
      await queueManager.startWorkers();
    });

    it('should add job to instance created queue', async () => {
      const jobData = {
        instanceId: 'test-instance-id',
        subscriptionId: 'test-subscription-id',
      };

      const jobId = await queueManager.addInstanceCreatedJob(jobData);

      expect(mockQueue.add).toHaveBeenCalledWith(
        'instance-created',
        {
          ...jobData,
          timestamp: expect.any(Number),
        },
        JOB_OPTIONS,
      );
      expect(jobId).toBe('test-job-id');
      expect(mockFastify.log.info).toHaveBeenCalledWith(
        { jobId: 'test-job-id', instanceId: 'test-instance-id' },
        'Instance created job added to queue',
      );
    });

    it('should include timestamp in job data', async () => {
      const beforeTime = Date.now();
      await queueManager.addInstanceCreatedJob({
        instanceId: 'test-instance-id',
        subscriptionId: 'test-subscription-id',
      });
      const afterTime = Date.now();

      const addCall = mockQueue.add.mock.calls[0];
      const jobData = addCall[1] as any;

      expect(jobData.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(jobData.timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('addInstanceDeletedJob', () => {
    beforeEach(async () => {
      await queueManager.startWorkers();
    });

    it('should add job to instance deleted queue', async () => {
      const jobData = {
        instanceId: 'test-instance-id',
        subscriptionId: 'test-subscription-id',
      };

      const jobId = await queueManager.addInstanceDeletedJob(jobData);

      expect(mockQueue.add).toHaveBeenCalledWith(
        'instance-deleted',
        {
          ...jobData,
          timestamp: expect.any(Number),
        },
        JOB_OPTIONS,
      );
      expect(jobId).toBe('test-job-id');
      expect(mockFastify.log.info).toHaveBeenCalledWith(
        { jobId: 'test-job-id', instanceId: 'test-instance-id' },
        'Instance deleted job added to queue',
      );
    });
  });

  describe('close', () => {
    beforeEach(async () => {
      await queueManager.startWorkers();
    });

    it('should close all workers and queues', async () => {
      await queueManager.close();

      expect(mockWorker.close).toHaveBeenCalledTimes(2);
      expect(mockQueue.close).toHaveBeenCalledTimes(2);
      expect(mockFastify.log.info).toHaveBeenCalledWith('Closing queue workers and connections');
      expect(mockFastify.log.info).toHaveBeenCalledWith('Queue workers and connections closed');
    });
  });

  describe('worker event handlers', () => {
    beforeEach(async () => {
      await queueManager.startWorkers();
    });

    it('should log completed jobs', async () => {
      const completedHandler = mockWorker.on.mock.calls.find((call) => call[0] === 'completed')?.[1];
      expect(completedHandler).toBeDefined();

      const mockJob = {
        id: 'test-job-id',
        attemptsMade: 1,
      } as any;

      completedHandler(mockJob, 'result', 'prev');

      expect(mockFastify.log.info).toHaveBeenCalledWith(
        {
          jobId: 'test-job-id',
          workerName: expect.any(String),
          attemptsMade: 1,
        },
        'Job completed successfully',
      );
    });

    it('should log failed jobs', async () => {
      const failedHandler = mockWorker.on.mock.calls.find((call) => call[0] === 'failed')?.[1];
      expect(failedHandler).toBeDefined();

      const mockJob = {
        id: 'test-job-id',
        attemptsMade: 2,
      } as any;
      const mockError = new Error('Test error');

      failedHandler(mockJob, mockError, 'prev');

      expect(mockFastify.log.error).toHaveBeenCalledWith(
        {
          jobId: 'test-job-id',
          workerName: expect.any(String),
          attemptsMade: 2,
          error: 'Test error',
        },
        'Job failed',
      );
    });

    it('should log worker errors', async () => {
      const errorHandler = mockWorker.on.mock.calls.find((call) => call[0] === 'error')?.[1];
      expect(errorHandler).toBeDefined();

      const mockError = new Error('Worker error') as any;

      // BullMQ error handler signature: (error, prev1, prev2)
      errorHandler(mockError, undefined, undefined);

      expect(mockFastify.log.error).toHaveBeenCalledWith(
        {
          workerName: expect.any(String),
          error: 'Worker error',
        },
        'Worker error',
      );
    });
  });
});
