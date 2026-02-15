import { VictoriaMetricsRepository } from './VictoriaMetricsRepository';
import pino from 'pino';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('VictoriaMetricsRepository', () => {
  let logger: pino.Logger;
  let mockAxiosInstance: any;

  beforeEach(() => {
    logger = pino({ level: 'silent' }); // Silent logger for tests
    jest.clearAllMocks();

    // Default mock implementation
    mockAxiosInstance = {
      get: jest.fn(),
    };
    mockedAxios.create = jest.fn().mockReturnValue(mockAxiosInstance);
  });

  const createSuccessResponse = (value: string) => ({
    data: {
      status: 'success',
      data: {
        result: [
          {
            value: [1234567890, value],
          },
        ],
      },
    },
  });

  it('should return graph.query count when metrics exist', async () => {
    mockAxiosInstance.get.mockResolvedValue(createSuccessResponse('42'));

    const repo = new VictoriaMetricsRepository('http://test-url:8429', { logger });
    const count = await repo.getGraphQueryCount('test-namespace');

    expect(count).toBe(42);
  });

  it('should return 0 when no metrics exist', async () => {
    mockAxiosInstance.get.mockResolvedValue({
      data: {
        status: 'success',
        data: {
          result: [],
        },
      },
    });

    const repo = new VictoriaMetricsRepository('http://test-url:8429', { logger });
    const count = await repo.getGraphQueryCount('test-namespace');

    expect(count).toBe(0);
  });

  it('should return null when query fails', async () => {
    mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

    const repo = new VictoriaMetricsRepository('http://test-url:8429', { logger });
    const count = await repo.getGraphQueryCount('test-namespace');

    expect(count).toBeNull();
  });

  it('should return null when VictoriaMetrics returns error status', async () => {
    mockAxiosInstance.get.mockResolvedValue({
      data: {
        status: 'error',
        error: 'Query failed',
      },
    });

    const repo = new VictoriaMetricsRepository('http://test-url:8429', { logger });
    const count = await repo.getGraphQueryCount('test-namespace');

    expect(count).toBeNull();
  });

  it('should return null for invalid namespace with special characters', async () => {
    const repo = new VictoriaMetricsRepository('http://test-url:8429', { logger });

    // Test various invalid characters
    expect(await repo.getGraphQueryCount('test{namespace}')).toBeNull();
    expect(await repo.getGraphQueryCount('test[namespace]')).toBeNull();
    expect(await repo.getGraphQueryCount('test"namespace')).toBeNull();
    expect(await repo.getGraphQueryCount('test\\namespace')).toBeNull();
    expect(await repo.getGraphQueryCount('test namespace')).toBeNull();
    expect(await repo.getGraphQueryCount('test\nnamespace')).toBeNull();
  });

  it('should accept valid namespace with alphanumeric, hyphens, and underscores', async () => {
    mockAxiosInstance.get.mockResolvedValue(createSuccessResponse('10'));

    const repo = new VictoriaMetricsRepository('http://test-url:8429', { logger });

    // Test valid namespace formats
    expect(await repo.getGraphQueryCount('test-namespace')).toBe(10);
    expect(await repo.getGraphQueryCount('test_namespace')).toBe(10);
    expect(await repo.getGraphQueryCount('TestNamespace123')).toBe(10);
    expect(await repo.getGraphQueryCount('test-namespace_123')).toBe(10);
  });
});
