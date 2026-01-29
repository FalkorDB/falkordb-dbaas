/**
 * Jest setup file
 * Runs before each test file
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.SERVICE_NAME = 'cluster-discovery-test';
process.env.PORT = '3001';
process.env.GOOGLE_CLOUD_PROJECT = 'test-project';
process.env.APPLICATION_PLANE_GOOGLE_CLOUD_PROJECT = 'test-app-project';
process.env.AWS_ROLE_ARN = 'arn:aws:iam::123456789:role/test-role';
process.env.BASTION_CLUSTER_NAME = 'test-bastion';
process.env.BASTION_CLUSTER_REGION = 'us-east-2';
process.env.BASTION_NAMESPACE = 'bootstrap';
process.env.BASTION_POD_LABEL = 'app=test';
process.env.OMNISTRATE_USER = 'test@example.com';
process.env.OMNISTRATE_PASSWORD = 'test-password';
process.env.OMNISTRATE_SERVICE_ID = 's-test';
process.env.OMNISTRATE_ENVIRONMENT_ID = 'se-test';
process.env.PAGERDUTY_INTEGRATION_KEY = 'test-key';
process.env.SCAN_INTERVAL_MS = '120000';
process.env.OTEL_ENABLED = 'false';

// Mock logger to reduce noise in tests
jest.mock('../src/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    child: jest.fn(() => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
    })),
  },
}));

// Global test utilities
global.mockResolvedValue = (value: any) => jest.fn().mockResolvedValue(value);
global.mockRejectedValue = (error: any) => jest.fn().mockRejectedValue(error);
