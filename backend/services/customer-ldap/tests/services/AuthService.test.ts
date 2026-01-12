import { AuthService } from '../../src/services/AuthService';
import { IOmnistrateRepository } from '../../src/repositories/omnistrate/IOmnistrateRepository';
import { ISessionRepository } from '../../src/repositories/session/ISessionRepository';
import pino from 'pino';

describe('AuthService', () => {
  let service: AuthService;
  let logger: pino.Logger;
  let mockOmnistrateRepo: jest.Mocked<IOmnistrateRepository>;
  let mockSessionRepo: jest.Mocked<ISessionRepository>;

  beforeEach(() => {
    logger = pino({ level: 'silent' });

    mockOmnistrateRepo = {
      validate: jest.fn(),
      getInstance: jest.fn(),
      getSubscriptionUsers: jest.fn(),
      checkIfUserHasAccessToInstance: jest.fn(),
    };

    mockSessionRepo = {
      createSession: jest.fn(),
      validateSession: jest.fn(),
      decodeSession: jest.fn(),
    };

    service = new AuthService({ logger }, mockOmnistrateRepo, mockSessionRepo);
  });

  describe('authenticateAndAuthorize', () => {
    it('should throw error when token is missing', async () => {
      await expect(
        service.authenticateAndAuthorize('', 'instance-id', 'sub-id'),
      ).rejects.toThrow();
    });

    it('should throw error when instanceId is missing', async () => {
      await expect(service.authenticateAndAuthorize('token', '', 'sub-id')).rejects.toThrow();
    });

    it('should throw error when subscriptionId is missing', async () => {
      await expect(service.authenticateAndAuthorize('token', 'instance-id', '')).rejects.toThrow();
    });

    it('should throw error for invalid token', async () => {
      mockOmnistrateRepo.validate.mockResolvedValue(false);

      await expect(
        service.authenticateAndAuthorize('invalid-token', 'instance-id', 'sub-id'),
      ).rejects.toThrow('Invalid authentication token');
    });

    it('should successfully authenticate and create session', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEyMyJ9.test';
      
      mockOmnistrateRepo.validate.mockResolvedValue(true);
      mockOmnistrateRepo.checkIfUserHasAccessToInstance.mockResolvedValue({
        hasAccess: true,
        role: 'writer',
      });
      mockOmnistrateRepo.getInstance.mockResolvedValue({
        id: 'instance-789',
        clusterId: 'c-test',
        region: 'us-central1',
        userId: 'user-123',
        createdDate: '2024-01-01',
        serviceId: 'service-id',
        environmentId: 'env-id',
        productTierId: 'tier-id',
        status: 'RUNNING',
        resourceId: 'resource-id',
        cloudProvider: 'gcp',
        productTierName: 'Free',
        deploymentType: 'standalone',
        subscriptionId: 'sub-456',
      });
      mockSessionRepo.createSession.mockReturnValue('session-token');

      const result = await service.authenticateAndAuthorize(mockToken, 'instance-789', 'sub-456');

      expect(result.session).toBe('session-token');
      expect(result.sessionData.userId).toBe('user-123');
      expect(result.sessionData.instanceId).toBe('instance-789');
      expect(result.sessionData.subscriptionId).toBe('sub-456');
      expect(result.sessionData.role).toBe('writer');
    });

    it('should throw error when user does not have access', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEyMyJ9.test';
      
      mockOmnistrateRepo.validate.mockResolvedValue(true);
      mockOmnistrateRepo.checkIfUserHasAccessToInstance.mockResolvedValue({
        hasAccess: false,
      });

      await expect(
        service.authenticateAndAuthorize(mockToken, 'instance-789', 'sub-456'),
      ).rejects.toThrow('User does not have access to this instance');
    });
  });

  describe('validateSession', () => {
    it('should call sessionRepository.validateSession', () => {
      mockSessionRepo.validateSession.mockReturnValue(true);
      
      const result = service.validateSession('session-cookie');
      
      expect(result).toBe(true);
      expect(mockSessionRepo.validateSession).toHaveBeenCalledWith('session-cookie');
    });
  });

  describe('decodeSession', () => {
    it('should call sessionRepository.decodeSession', () => {
      const mockSessionData = {
        userId: 'user-123',
        subscriptionId: 'sub-456',
        instanceId: 'instance-789',
        cloudProvider: 'gcp' as const,
        region: 'us-central1',
        k8sClusterName: 'c-test',
        role: 'writer' as const,
      };
      
      mockSessionRepo.decodeSession.mockReturnValue(mockSessionData);
      
      const result = service.decodeSession('session-cookie');
      
      expect(result).toEqual(mockSessionData);
      expect(mockSessionRepo.decodeSession).toHaveBeenCalledWith('session-cookie');
    });
  });

  describe('checkPermission', () => {
    it('should return true when user has root role', () => {
      expect(AuthService.checkPermission('root', 'reader')).toBe(true);
      expect(AuthService.checkPermission('root', 'writer')).toBe(true);
    });

    it('should return true when user has writer role for writer requirement', () => {
      expect(AuthService.checkPermission('writer', 'writer')).toBe(true);
      expect(AuthService.checkPermission('writer', 'reader')).toBe(true);
    });

    it('should return false when user has reader role for writer requirement', () => {
      expect(AuthService.checkPermission('reader', 'writer')).toBe(false);
    });

    it('should return true when user has reader role for reader requirement', () => {
      expect(AuthService.checkPermission('reader', 'reader')).toBe(true);
    });
  });
});
