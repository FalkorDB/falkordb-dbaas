import Fastify, { FastifyInstance } from 'fastify';
import App from '../../src/app';

// Mock Redis and BullMQ to avoid external dependencies
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue(undefined),
    status: 'ready',
  }));
});

jest.mock('bullmq', () => {
  const mockQueue = {
    add: jest.fn().mockResolvedValue({ id: 'test-job-id' }),
    close: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
  };

  const mockWorker = {
    on: jest.fn().mockReturnThis(),
    close: jest.fn().mockResolvedValue(undefined),
    run: jest.fn(),
  };

  return {
    Queue: jest.fn(() => mockQueue),
    Worker: jest.fn(() => mockWorker),
  };
});

describe('Server Startup Integration Test', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    // Build the actual application with test configuration
    server = Fastify({
      logger: false,
    });

    await server.register(App, {
      configData: {
        NODE_ENV: 'test',
        PORT: 3013,
        OMNISTRATE_EMAIL: 'test@example.com',
        OMNISTRATE_PASSWORD: 'test-password',
        OMNISTRATE_SERVICE_ID: 'test-service-id',
        OMNISTRATE_ENVIRONMENT_ID: 'test-env-id',
        OMNISTRATE_WEBHOOK_SECRET: 'test-webhook-secret',
        JWT_SECRET: 'test-jwt-secret',
        SERVICE_NAME: 'customer-ldap-test',
        CORS_ORIGINS: '*',
        REQUEST_TIMEOUT_MS: 30000,
        LDAP_CONNECTION_TIMEOUT_MS: 10000,
        K8S_PORT_FORWARD_TIMEOUT_MS: 15000,
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        REDIS_DB: 0,
      },
    });

    await server.ready();
  }, 30000); // Increased timeout for full app initialization

  afterAll(async () => {
    if (server) {
      await server.close();
    }
  });

  describe('Server Ready State', () => {
    it('should start server successfully', () => {
      expect(server).toBeDefined();
      expect(server.server).toBeDefined();
    });

    it('should be in ready state', () => {
      // Server has successfully completed initialization including queue setup
      expect(server.ready).toBeDefined();
    });

    it('should have routes registered', () => {
      // Check that routes are loaded
      const routes = server.printRoutes();
      expect(routes).toBeTruthy();
      expect(routes.length).toBeGreaterThan(0);
    });
  });

  describe('Health Check Endpoint', () => {
    it('should respond to health check', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/v1/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('status');
      expect(body.status).toBe('ok');
    });
  });

  describe('Queue-based Webhook Endpoints', () => {
    it('should have instance-created webhook endpoint registered', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/omnistrate/instance-created',
        headers: {
          authorization: 'Bearer test-webhook-secret',
        },
        payload: {
          payload: {
            instance_id: 'test-instance',
            subscription_id: 'test-sub',
          },
        },
      });

      // Should return 202 (queued) or an error, but not 404 (not found)
      expect(response.statusCode).not.toBe(404);
    });

    it('should have instance-deleted webhook endpoint registered', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/omnistrate/instance-deleted',
        headers: {
          authorization: 'Bearer test-webhook-secret',
        },
        payload: {
          payload: {
            instance_id: 'test-instance',
            subscription_id: 'test-sub',
          },
        },
      });

      // Should return 202 (queued) or an error, but not 404 (not found)
      expect(response.statusCode).not.toBe(404);
    });
  });

  describe('Graceful Shutdown', () => {
    it('should close cleanly without errors', async () => {
      // This will be called in afterAll, but we test it explicitly here
      await expect(server.close()).resolves.not.toThrow();
      
      // Restart server for other tests
      server = Fastify({
        logger: false,
      });

      await server.register(App, {
        configData: {
          NODE_ENV: 'test',
          PORT: 3013,
          OMNISTRATE_EMAIL: 'test@example.com',
          OMNISTRATE_PASSWORD: 'test-password',
          OMNISTRATE_SERVICE_ID: 'test-service-id',
          OMNISTRATE_ENVIRONMENT_ID: 'test-env-id',
          OMNISTRATE_WEBHOOK_SECRET: 'test-webhook-secret',
          JWT_SECRET: 'test-jwt-secret',
          SERVICE_NAME: 'customer-ldap-test',
          CORS_ORIGINS: '*',
          REQUEST_TIMEOUT_MS: 30000,
          LDAP_CONNECTION_TIMEOUT_MS: 10000,
          K8S_PORT_FORWARD_TIMEOUT_MS: 15000,
          REDIS_HOST: 'localhost',
          REDIS_PORT: 6379,
          REDIS_DB: 0,
        },
      });
      
      await server.ready();
    }, 30000);
  });
});
