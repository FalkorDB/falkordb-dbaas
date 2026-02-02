import Fastify, { FastifyInstance } from 'fastify';
import { QueueManager } from '../../src/queues/QueueManager';

// Mock the queue manager
jest.mock('../../src/queues/QueueManager');

// Mock other dependencies
jest.mock('@falkordb/configs', () => ({
  init: jest.fn(),
}));

jest.mock('@falkordb/plugins', () => ({
  swaggerPlugin: jest.fn().mockImplementation(async () => {}),
  omnistratePlugin: jest.fn().mockImplementation(async () => {}),
}));

jest.mock('@autotelic/fastify-opentelemetry', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(async () => {}),
}));

jest.mock('../../src/container', () => ({
  setupGlobalContainer: jest.fn(),
  setupContainer: jest.fn(),
}));

describe('Omnistrate Webhook Routes with Queue', () => {
  let server: FastifyInstance;
  let mockQueueManager: jest.Mocked<QueueManager>;

  beforeAll(async () => {
    // Create mock queue manager
    mockQueueManager = {
      addInstanceCreatedJob: jest.fn().mockResolvedValue('test-job-id-123'),
      addInstanceDeletedJob: jest.fn().mockResolvedValue('test-job-id-456'),
      startWorkers: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    } as any;

    (QueueManager as jest.MockedClass<typeof QueueManager>).mockImplementation(() => mockQueueManager);

    server = Fastify({
      logger: false,
    });

    // Register sensible plugin for reply decorators
    await server.register(require('@fastify/sensible'));

    // Register minimal app configuration for testing
    await server.register(require('@fastify/env'), {
      schema: {
        type: 'object',
        properties: {
          NODE_ENV: { type: 'string', default: 'test' },
          PORT: { type: 'number', default: 3013 },
          OMNISTRATE_EMAIL: { type: 'string', default: 'test@example.com' },
          OMNISTRATE_PASSWORD: { type: 'string', default: 'password' },
          OMNISTRATE_SERVICE_ID: { type: 'string', default: 'service-id' },
          OMNISTRATE_ENVIRONMENT_ID: { type: 'string', default: 'env-id' },
          OMNISTRATE_WEBHOOK_SECRET: { type: 'string', default: 'webhook-secret' },
          JWT_SECRET: { type: 'string', default: 'test-secret-key' },
          SERVICE_NAME: { type: 'string', default: 'customer-ldap-test' },
          REDIS_HOST: { type: 'string', default: 'localhost' },
          REDIS_PORT: { type: 'number', default: 6379 },
          REDIS_DB: { type: 'number', default: 0 },
        },
      },
      data: {
        NODE_ENV: 'test',
        PORT: 3013,
        OMNISTRATE_EMAIL: 'test@example.com',
        OMNISTRATE_PASSWORD: 'password',
        OMNISTRATE_SERVICE_ID: 'service-id',
        OMNISTRATE_ENVIRONMENT_ID: 'env-id',
        OMNISTRATE_WEBHOOK_SECRET: 'webhook-secret',
        JWT_SECRET: 'test-secret-key',
        SERVICE_NAME: 'customer-ldap-test',
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        REDIS_DB: 0,
      },
    });

    // Attach mock queue manager to server
    (server as any).queueManager = mockQueueManager;

    // Register routes
    await server.register(require('../../src/routes/v1/omnistrate/router').default);

    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /v1/omnistrate/instance-created', () => {
    it('should enqueue job and return 202 Accepted', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/omnistrate/instance-created',
        headers: {
          authorization: 'Bearer webhook-secret',
        },
        payload: {
          payload: {
            instance_id: 'test-instance-123',
            subscription_id: 'test-sub-456',
          },
        },
      });

      expect(response.statusCode).toBe(202);
      expect(JSON.parse(response.body)).toEqual({
        message: 'Instance created webhook accepted and queued for processing',
        jobId: 'test-job-id-123',
      });
      expect(mockQueueManager.addInstanceCreatedJob).toHaveBeenCalledWith({
        instanceId: 'test-instance-123',
        subscriptionId: 'test-sub-456',
      });
    });

    it('should return 401 without authentication', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/omnistrate/instance-created',
        payload: {
          payload: {
            instance_id: 'test-instance-123',
            subscription_id: 'test-sub-456',
          },
        },
      });

      expect(response.statusCode).toBe(401);
      expect(mockQueueManager.addInstanceCreatedJob).not.toHaveBeenCalled();
    });

    it('should return 500 if queue manager is not initialized', async () => {
      const tempServer = Fastify({ logger: false });

      await tempServer.register(require('@fastify/env'), {
        schema: {
          type: 'object',
          properties: {
            OMNISTRATE_WEBHOOK_SECRET: { type: 'string', default: 'webhook-secret' },
          },
        },
        data: {
          OMNISTRATE_WEBHOOK_SECRET: 'webhook-secret',
        },
      });

      // Don't attach queue manager
      await tempServer.register(require('../../src/routes/v1/omnistrate/router').default);
      await tempServer.ready();

      const response = await tempServer.inject({
        method: 'POST',
        url: '/v1/omnistrate/instance-created',
        headers: {
          authorization: 'Bearer webhook-secret',
        },
        payload: {
          payload: {
            instance_id: 'test-instance-123',
            subscription_id: 'test-sub-456',
          },
        },
      });

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Internal server error');

      await tempServer.close();
    });

    it('should return 500 if enqueuing fails', async () => {
      mockQueueManager.addInstanceCreatedJob.mockRejectedValueOnce(new Error('Redis connection error'));

      const response = await server.inject({
        method: 'POST',
        url: '/v1/omnistrate/instance-created',
        headers: {
          authorization: 'Bearer webhook-secret',
        },
        payload: {
          payload: {
            instance_id: 'test-instance-123',
            subscription_id: 'test-sub-456',
          },
        },
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toEqual({
        error: 'Internal server error',
        message: 'Failed to queue webhook for processing - webhook will be retried',
      });
    });
  });

  describe('POST /v1/omnistrate/instance-deleted', () => {
    it('should enqueue job and return 202 Accepted', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/omnistrate/instance-deleted',
        headers: {
          authorization: 'Bearer webhook-secret',
        },
        payload: {
          payload: {
            instance_id: 'test-instance-789',
            subscription_id: 'test-sub-012',
          },
        },
      });

      expect(response.statusCode).toBe(202);
      expect(JSON.parse(response.body)).toEqual({
        message: 'Instance deleted webhook accepted and queued for processing',
        jobId: 'test-job-id-456',
      });
      expect(mockQueueManager.addInstanceDeletedJob).toHaveBeenCalledWith({
        instanceId: 'test-instance-789',
        subscriptionId: 'test-sub-012',
      });
    });

    it('should return 401 without authentication', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/omnistrate/instance-deleted',
        payload: {
          payload: {
            instance_id: 'test-instance-789',
            subscription_id: 'test-sub-012',
          },
        },
      });

      expect(response.statusCode).toBe(401);
      expect(mockQueueManager.addInstanceDeletedJob).not.toHaveBeenCalled();
    });

    it('should return 500 if enqueuing fails', async () => {
      mockQueueManager.addInstanceDeletedJob.mockRejectedValueOnce(new Error('Queue full'));

      const response = await server.inject({
        method: 'POST',
        url: '/v1/omnistrate/instance-deleted',
        headers: {
          authorization: 'Bearer webhook-secret',
        },
        payload: {
          payload: {
            instance_id: 'test-instance-789',
            subscription_id: 'test-sub-012',
          },
        },
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toEqual({
        error: 'Internal server error',
        message: 'Failed to queue webhook for processing - webhook will be retried',
      });
    });
  });
});
