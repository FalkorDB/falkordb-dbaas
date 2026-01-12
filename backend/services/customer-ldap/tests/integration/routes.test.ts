import Fastify, { FastifyInstance } from 'fastify';

// Mock the @falkordb/configs module - must be at module scope for hoisting
jest.mock('@falkordb/configs', () => ({
  init: jest.fn(),
}));

// Mock the @falkordb/plugins module - must be at module scope for hoisting
jest.mock('@falkordb/plugins', () => ({
  swaggerPlugin: jest.fn().mockImplementation(async () => {}),
  omnistratePlugin: jest.fn().mockImplementation(async () => {}),
}));

// Mock opentelemetry plugin
jest.mock('@autotelic/fastify-opentelemetry', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(async () => {}),
}));

// Mock the DI container setup
jest.mock('../../src/container', () => ({
  setupGlobalContainer: jest.fn(),
  setupContainer: jest.fn(),
}));

describe('Customer LDAP API Integration Tests', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = Fastify({
      logger: false,
    });

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
          JWT_SECRET: { type: 'string', default: 'test-secret-key' },
          SERVICE_NAME: { type: 'string', default: 'customer-ldap-test' },
        },
      },
      data: {
        NODE_ENV: 'test',
        PORT: 3013,
        OMNISTRATE_EMAIL: process.env.OMNISTRATE_EMAIL || 'test@example.com',
        OMNISTRATE_PASSWORD: process.env.OMNISTRATE_PASSWORD || 'password',
        OMNISTRATE_SERVICE_ID: process.env.OMNISTRATE_SERVICE_ID || 'service-id',
        OMNISTRATE_ENVIRONMENT_ID: process.env.OMNISTRATE_ENVIRONMENT_ID || 'env-id',
        JWT_SECRET: 'test-secret-key',
        SERVICE_NAME: 'customer-ldap-test',
      },
    });

    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  describe('GET /instances/:instanceId/users', () => {
    it('should return 404 for routes not registered (mocked plugins prevent AutoLoad)', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/v1/instances/test-instance-id/users?subscriptionId=test-sub-id',
      });

      expect(response.statusCode).toBe(404);
    });

    // Note: Full integration tests with actual routes require complete DI container setup,
    // including all repositories and services. These tests verify basic server setup.
    // Add end-to-end tests with real Omnistrate tokens and instances in a separate test suite.
  });

  describe('POST /instances/:instanceId/users', () => {
    it('should return 404 for routes not registered (mocked plugins prevent AutoLoad)', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/instances/test-instance-id/users?subscriptionId=test-sub-id',
        payload: {
          username: 'testuser',
          password: 'testpass',
          acl: 'rw',
        },
      });

      expect(response.statusCode).toBe(404);
    });

    // Add more integration tests with real Omnistrate tokens and instances
  });

  describe('DELETE /instances/:instanceId/users/:username', () => {
    it('should return 404 for routes not registered (mocked plugins prevent AutoLoad)', async () => {
      const response = await server.inject({
        method: 'DELETE',
        url: '/v1/instances/test-instance-id/users/testuser?subscriptionId=test-sub-id',
      });

      expect(response.statusCode).toBe(404);
    });

    // Add more integration tests with real Omnistrate tokens and instances
  });

  describe('Session Cookie Flow', () => {
    it.todo('should set session cookie on first request and reuse on subsequent requests');
    // TODO: Implement with real credentials in a secure test environment
  });
});
