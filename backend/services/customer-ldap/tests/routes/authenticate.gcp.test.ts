import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { createAuthenticateHook } from '../../../src/routes/v1/instances/hooks/authenticate';
import { ISessionRepository } from '../../../src/repositories/session/ISessionRepository';
import { IOmnistrateRepository } from '../../../src/repositories/omnistrate/IOmnistrateRepository';
import { GcpServiceAccountValidator } from '../../../src/services/GcpServiceAccountValidator';

// Mock the GcpServiceAccountValidator
jest.mock('../../../src/services/GcpServiceAccountValidator');

describe('createAuthenticateHook with GCP service account', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockSessionRepository: jest.Mocked<ISessionRepository>;
  let mockOmnistrateRepository: jest.Mocked<IOmnistrateRepository>;
  let mockGcpValidator: jest.Mocked<GcpServiceAccountValidator>;

  beforeEach(() => {
    // Create mock repositories
    mockSessionRepository = {
      createSession: jest.fn(),
      validateSession: jest.fn(),
      decodeSession: jest.fn(),
    } as jest.Mocked<ISessionRepository>;

    mockOmnistrateRepository = {
      validate: jest.fn(),
      getInstance: jest.fn(),
      getSubscriptionUsers: jest.fn(),
      checkIfUserHasAccessToInstance: jest.fn(),
    } as jest.Mocked<IOmnistrateRepository>;

    // Create mock GCP validator
    mockGcpValidator = {
      validateServiceAccountToken: jest.fn(),
      getAdminServiceAccountEmail: jest.fn(),
    } as unknown as jest.Mocked<GcpServiceAccountValidator>;

    // Mock the GcpServiceAccountValidator constructor
    (GcpServiceAccountValidator as jest.MockedClass<typeof GcpServiceAccountValidator>).mockImplementation(
      () => mockGcpValidator,
    );

    // Create mock request and reply
    mockRequest = {
      params: { instanceId: 'instance-123' },
      query: { subscriptionId: 'sub-456' },
      headers: {},
      cookies: {},
      log: {
        info: jest.fn(),
        debug: jest.fn(),
        error: jest.fn(),
      } as unknown as FastifyRequest['log'],
      server: {
        httpErrors: {
          badRequest: (msg: string) => new Error(msg),
          unauthorized: (msg: string) => new Error(msg),
          forbidden: (msg: string) => new Error(msg),
        },
      } as unknown as FastifyRequest['server'],
      diScope: {
        resolve: jest.fn((name: string) => {
          if (name === ISessionRepository.repositoryName) {
            return mockSessionRepository;
          }
          if (name === IOmnistrateRepository.repositoryName) {
            return mockOmnistrateRepository;
          }
          return null;
        }),
      } as unknown as FastifyRequest['diScope'],
    };

    mockReply = {
      setCookie: jest.fn(),
    } as unknown as FastifyReply;

    // Set up default environment
    process.env.GCP_ADMIN_SERVICE_ACCOUNT_EMAIL = 'admin@project.iam.gserviceaccount.com';
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.GCP_ADMIN_SERVICE_ACCOUNT_EMAIL;
  });

  describe('GCP service account authentication', () => {
    it('should authenticate with valid GCP service account token', async () => {
      const hook = createAuthenticateHook('reader');

      // Set up GCP service account token
      mockRequest.headers = {
        authorization: 'Bearer gcp-service-account-token',
      };

      // Mock GCP validation to succeed
      mockGcpValidator.validateServiceAccountToken.mockResolvedValue(true);
      mockGcpValidator.getAdminServiceAccountEmail.mockReturnValue('admin@project.iam.gserviceaccount.com');

      // Mock instance details
      mockOmnistrateRepository.getInstance.mockResolvedValue({
        id: 'instance-123',
        subscriptionId: 'sub-456',
        clusterId: 'cluster-xyz',
        region: 'us-central1',
        cloudProvider: 'gcp',
        userId: 'user-789',
        createdDate: '2024-01-01',
        serviceId: 'service-id',
        environmentId: 'env-id',
        productTierId: 'tier-id',
        status: 'RUNNING',
        resourceId: 'resource-id',
        productTierName: 'Free',
        deploymentType: 'standalone',
      });

      // Mock session creation
      mockSessionRepository.createSession.mockReturnValue('session-token');

      await hook(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Verify GCP validator was called
      expect(mockGcpValidator.validateServiceAccountToken).toHaveBeenCalledWith('gcp-service-account-token');

      // Verify session was created with root role
      expect(mockSessionRepository.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'admin@project.iam.gserviceaccount.com',
          subscriptionId: 'sub-456',
          instanceId: 'instance-123',
          role: 'root',
        }),
      );

      // Verify session cookie was set
      expect(mockReply.setCookie).toHaveBeenCalledWith(
        expect.any(String),
        'session-token',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          signed: true,
        }),
      );

      // Verify session data was attached to request
      expect((mockRequest as FastifyRequest).sessionData).toBeDefined();
      expect((mockRequest as FastifyRequest).sessionData?.role).toBe('root');
    });

    it('should fall back to Omnistrate authentication when GCP validation fails', async () => {
      const hook = createAuthenticateHook('reader');

      // Set up Omnistrate token
      mockRequest.headers = {
        authorization: 'Bearer omnistrate-token',
      };

      // Mock GCP validation to fail
      mockGcpValidator.validateServiceAccountToken.mockResolvedValue(false);

      // Mock Omnistrate authentication
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJ1c2VyLTEyMyJ9.test';
      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      mockOmnistrateRepository.validate.mockResolvedValue(true);
      mockOmnistrateRepository.checkIfUserHasAccessToInstance.mockResolvedValue({
        hasAccess: true,
        role: 'writer',
      });
      mockOmnistrateRepository.getInstance.mockResolvedValue({
        id: 'instance-123',
        subscriptionId: 'sub-456',
        clusterId: 'cluster-xyz',
        region: 'us-central1',
        cloudProvider: 'gcp',
        userId: 'user-123',
        createdDate: '2024-01-01',
        serviceId: 'service-id',
        environmentId: 'env-id',
        productTierId: 'tier-id',
        status: 'RUNNING',
        resourceId: 'resource-id',
        productTierName: 'Free',
        deploymentType: 'standalone',
      });
      mockSessionRepository.createSession.mockReturnValue('omnistrate-session-token');

      await hook(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Verify GCP validator was tried first
      expect(mockGcpValidator.validateServiceAccountToken).toHaveBeenCalled();

      // Verify Omnistrate auth was used
      expect(mockOmnistrateRepository.validate).toHaveBeenCalledWith(mockToken);

      // Verify session was created with writer role (not root)
      expect(mockSessionRepository.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          role: 'writer',
        }),
      );
    });

    it('should throw error when subscription ID does not match instance for GCP token', async () => {
      const hook = createAuthenticateHook('reader');

      mockRequest.headers = {
        authorization: 'Bearer gcp-service-account-token',
      };
      mockRequest.query = { subscriptionId: 'wrong-sub-id' };

      // Mock GCP validation to succeed
      mockGcpValidator.validateServiceAccountToken.mockResolvedValue(true);
      mockGcpValidator.getAdminServiceAccountEmail.mockReturnValue('admin@project.iam.gserviceaccount.com');

      // Mock instance with different subscription ID
      mockOmnistrateRepository.getInstance.mockResolvedValue({
        id: 'instance-123',
        subscriptionId: 'sub-456', // Different from query
        clusterId: 'cluster-xyz',
        region: 'us-central1',
        cloudProvider: 'gcp',
        userId: 'user-789',
        createdDate: '2024-01-01',
        serviceId: 'service-id',
        environmentId: 'env-id',
        productTierId: 'tier-id',
        status: 'RUNNING',
        resourceId: 'resource-id',
        productTierName: 'Free',
        deploymentType: 'standalone',
      });

      await expect(hook(mockRequest as FastifyRequest, mockReply as FastifyReply)).rejects.toThrow(
        'Subscription ID does not match instance',
      );
    });

    it('should use gcp-admin as fallback userId when email is not available', async () => {
      const hook = createAuthenticateHook('reader');

      mockRequest.headers = {
        authorization: 'Bearer gcp-service-account-token',
      };

      // Mock GCP validation to succeed but no email
      mockGcpValidator.validateServiceAccountToken.mockResolvedValue(true);
      mockGcpValidator.getAdminServiceAccountEmail.mockReturnValue(undefined);

      mockOmnistrateRepository.getInstance.mockResolvedValue({
        id: 'instance-123',
        subscriptionId: 'sub-456',
        clusterId: 'cluster-xyz',
        region: 'us-central1',
        cloudProvider: 'gcp',
        userId: 'user-789',
        createdDate: '2024-01-01',
        serviceId: 'service-id',
        environmentId: 'env-id',
        productTierId: 'tier-id',
        status: 'RUNNING',
        resourceId: 'resource-id',
        productTierName: 'Free',
        deploymentType: 'standalone',
      });

      mockSessionRepository.createSession.mockReturnValue('session-token');

      await hook(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockSessionRepository.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'gcp-admin',
        }),
      );
    });
  });
});
