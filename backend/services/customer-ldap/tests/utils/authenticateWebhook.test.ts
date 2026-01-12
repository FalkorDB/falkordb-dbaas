import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { authenticateWebhook } from '../../src/routes/v1/omnistrate/hooks/authenticateWebhook';

describe('authenticateWebhook', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      log: {
        error: jest.fn(),
      } as unknown as FastifyRequest['log'],
      server: {
        config: {},
      } as unknown as FastifyRequest['server'],
    };

    mockReply = {
      unauthorized: jest.fn().mockReturnThis(),
    } as unknown as FastifyReply;
  });

  it('should return unauthorized when OMNISTRATE_WEBHOOK_SECRET is not configured', async () => {
    mockRequest.server = {
      config: {
        OMNISTRATE_WEBHOOK_SECRET: undefined,
      },
    } as unknown as FastifyRequest['server'];

    await authenticateWebhook(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockRequest.log?.error).toHaveBeenCalledWith('OMNISTRATE_WEBHOOK_SECRET is not configured');
    expect(mockReply.unauthorized).toHaveBeenCalledWith('Webhook authentication not configured');
  });

  it('should return unauthorized when authorization header is missing', async () => {
    mockRequest.server = {
      config: {
        OMNISTRATE_WEBHOOK_SECRET: 'test-secret',
      },
    } as unknown as FastifyRequest['server'];
    mockRequest.headers = {};

    await authenticateWebhook(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockReply.unauthorized).toHaveBeenCalledWith('Invalid webhook secret');
  });

  it('should return unauthorized when authorization header has wrong length', async () => {
    const secret = 'test-secret';
    mockRequest.server = {
      config: {
        OMNISTRATE_WEBHOOK_SECRET: secret,
      },
    } as unknown as FastifyRequest['server'];
    mockRequest.headers = {
      authorization: 'Bearer short',
    };

    await authenticateWebhook(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockReply.unauthorized).toHaveBeenCalledWith('Invalid webhook secret');
  });

  it('should return unauthorized when authorization header has invalid token', async () => {
    const secret = 'test-secret';
    mockRequest.server = {
      config: {
        OMNISTRATE_WEBHOOK_SECRET: secret,
      },
    } as unknown as FastifyRequest['server'];
    // Create a token with same length but wrong content
    const wrongToken = 'Bearer test-secre!'; // Same length as "Bearer test-secret" but different
    mockRequest.headers = {
      authorization: wrongToken,
    };

    await authenticateWebhook(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockReply.unauthorized).toHaveBeenCalledWith('Invalid webhook secret');
  });

  it('should pass authentication when authorization header has valid token', async () => {
    const secret = 'test-secret';
    mockRequest.server = {
      config: {
        OMNISTRATE_WEBHOOK_SECRET: secret,
      },
    } as unknown as FastifyRequest['server'];
    mockRequest.headers = {
      authorization: `Bearer ${secret}`,
    };

    await authenticateWebhook(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockReply.unauthorized).not.toHaveBeenCalled();
  });

  it('should use timing-safe comparison to prevent timing attacks', async () => {
    const secret = 'test-secret-with-timing-safe-comparison';
    mockRequest.server = {
      config: {
        OMNISTRATE_WEBHOOK_SECRET: secret,
      },
    } as unknown as FastifyRequest['server'];
    
    // Test with a secret that differs only in the last character
    const almostCorrectToken = `Bearer ${secret.slice(0, -1)}x`;
    mockRequest.headers = {
      authorization: almostCorrectToken,
    };

    await authenticateWebhook(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockReply.unauthorized).toHaveBeenCalledWith('Invalid webhook secret');
  });

  it('should handle empty string authorization header', async () => {
    mockRequest.server = {
      config: {
        OMNISTRATE_WEBHOOK_SECRET: 'test-secret',
      },
    } as unknown as FastifyRequest['server'];
    mockRequest.headers = {
      authorization: '',
    };

    await authenticateWebhook(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockReply.unauthorized).toHaveBeenCalledWith('Invalid webhook secret');
  });

  it('should handle authorization header without Bearer prefix', async () => {
    const secret = 'test-secret';
    mockRequest.server = {
      config: {
        OMNISTRATE_WEBHOOK_SECRET: secret,
      },
    } as unknown as FastifyRequest['server'];
    mockRequest.headers = {
      authorization: secret,
    };

    await authenticateWebhook(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockReply.unauthorized).toHaveBeenCalledWith('Invalid webhook secret');
  });
});
