import { SessionRepository } from '../../src/repositories/session/SessionRepository';
import { SessionData } from '../../src/repositories/session/ISessionRepository';
import pino from 'pino';

describe('SessionRepository', () => {
  let repository: SessionRepository;
  let logger: pino.Logger;
  const jwtSecret = 'test-secret-key';

  beforeEach(() => {
    logger = pino({ level: 'silent' });
    repository = new SessionRepository(jwtSecret, { logger });
  });

  describe('createSession', () => {
    it('should throw error when required parameters are missing', () => {
      const invalidData = {
        userId: '',
        subscriptionId: 'sub-id',
        instanceId: 'instance-id',
        cloudProvider: 'gcp' as const,
        region: 'us-central1',
        k8sClusterName: 'cluster-1',
        role: 'reader' as const,
      };

      expect(() => repository.createSession(invalidData)).toThrow();
    });

    it('should create a valid session token', () => {
      const sessionData: SessionData = {
        userId: 'user-123',
        subscriptionId: 'sub-456',
        instanceId: 'instance-789',
        cloudProvider: 'gcp',
        region: 'us-central1',
        k8sClusterName: 'c-test',
        role: 'writer',
      };

      const token = repository.createSession(sessionData);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format
    });
  });

  describe('validateSession', () => {
    it('should return false for empty cookie', () => {
      expect(repository.validateSession('')).toBe(false);
    });

    it('should return false for invalid token', () => {
      expect(repository.validateSession('invalid-token')).toBe(false);
    });

    it('should return true for valid token', () => {
      const sessionData: SessionData = {
        userId: 'user-123',
        subscriptionId: 'sub-456',
        instanceId: 'instance-789',
        cloudProvider: 'gcp',
        region: 'us-central1',
        k8sClusterName: 'c-test',
        role: 'writer',
      };

      const token = repository.createSession(sessionData);
      expect(repository.validateSession(token)).toBe(true);
    });

    it('should return false for expired token', (done) => {
      // Create a repository with a very short expiry for testing
      const shortExpiryRepo = new (class extends SessionRepository {
        SESSION_EXPIRY = 1; // 1 second
      })(jwtSecret, { logger });

      const sessionData: SessionData = {
        userId: 'user-123',
        subscriptionId: 'sub-456',
        instanceId: 'instance-789',
        cloudProvider: 'gcp',
        region: 'us-central1',
        k8sClusterName: 'c-test',
        role: 'writer',
      };

      const token = shortExpiryRepo.createSession(sessionData);

      setTimeout(() => {
        expect(shortExpiryRepo.validateSession(token)).toBe(false);
        done();
      }, 2000);
    }, 10000);
  });

  describe('decodeSession', () => {
    it('should return null for empty cookie', () => {
      expect(repository.decodeSession('')).toBeNull();
    });

    it('should return null for invalid token', () => {
      expect(repository.decodeSession('invalid-token')).toBeNull();
    });

    it('should decode valid token correctly', () => {
      const sessionData: SessionData = {
        userId: 'user-123',
        subscriptionId: 'sub-456',
        instanceId: 'instance-789',
        cloudProvider: 'gcp',
        region: 'us-central1',
        k8sClusterName: 'c-test',
        role: 'writer',
      };

      const token = repository.createSession(sessionData);
      const decoded = repository.decodeSession(token);

      expect(decoded).toBeTruthy();
      expect(decoded?.userId).toBe(sessionData.userId);
      expect(decoded?.subscriptionId).toBe(sessionData.subscriptionId);
      expect(decoded?.instanceId).toBe(sessionData.instanceId);
      expect(decoded?.cloudProvider).toBe(sessionData.cloudProvider);
      expect(decoded?.region).toBe(sessionData.region);
      expect(decoded?.k8sClusterName).toBe(sessionData.k8sClusterName);
      expect(decoded?.role).toBe(sessionData.role);
    });
  });
});
