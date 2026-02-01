import { processInstanceDeleted } from '../../src/queues/processors/instanceDeletedProcessor';
import { Job } from 'bullmq';
import { FastifyInstance } from 'fastify';
import { IOmnistrateRepository } from '../../src/repositories/omnistrate/IOmnistrateRepository';
import { IK8sRepository } from '../../src/repositories/k8s/IK8sRepository';
import { IK8sCredentialsRepository } from '../../src/repositories/k8s-credentials/IK8sCredentialsRepository';
import { ILdapRepository } from '../../src/repositories/ldap/ILdapRepository';
import { IConnectionCacheRepository } from '../../src/repositories/connection-cache/IConnectionCacheRepository';
import { UserService } from '../../src/services/UserService';
import { JOB_TIMEOUT_MS } from '../../src/queues/config';

jest.mock('../../src/services/UserService');

describe('processInstanceDeleted', () => {
  let mockFastify: FastifyInstance;
  let mockJob: Job;
  let mockOmnistrateRepo: jest.Mocked<IOmnistrateRepository>;
  let mockK8sRepo: jest.Mocked<IK8sRepository>;
  let mockK8sCredentialsRepo: jest.Mocked<IK8sCredentialsRepository>;
  let mockLdapRepo: jest.Mocked<ILdapRepository>;
  let mockConnectionCache: jest.Mocked<IConnectionCacheRepository>;
  let mockUserService: jest.Mocked<UserService>;
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      child: jest.fn().mockReturnThis(),
    };

    mockOmnistrateRepo = {
      getInstance: jest.fn(),
    } as any;

    mockK8sRepo = {} as any;
    mockK8sCredentialsRepo = {} as any;
    mockLdapRepo = {} as any;
    mockConnectionCache = {} as any;

    mockUserService = {
      listUsers: jest.fn(),
      deleteUser: jest.fn(),
    } as any;

    (UserService as jest.MockedClass<typeof UserService>).mockImplementation(() => mockUserService);

    mockFastify = {
      log: mockLogger,
      diContainer: {
        resolve: jest.fn((name: string) => {
          if (name === IOmnistrateRepository.repositoryName) return mockOmnistrateRepo;
          if (name === IK8sRepository.repositoryName) return mockK8sRepo;
          if (name === IK8sCredentialsRepository.repositoryName) return mockK8sCredentialsRepo;
          if (name === ILdapRepository.repositoryName) return mockLdapRepo;
          if (name === IConnectionCacheRepository.repositoryName) return mockConnectionCache;
          return null;
        }),
      },
    } as any;

    mockJob = {
      id: 'test-job-id',
      data: {
        instanceId: 'test-instance-id',
        subscriptionId: 'test-subscription-id',
        timestamp: Date.now(),
      },
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('successful processing', () => {
    beforeEach(() => {
      mockOmnistrateRepo.getInstance.mockResolvedValue({
        instanceId: 'test-instance-id',
        cloudProvider: 'gcp',
        clusterId: 'test-cluster',
        region: 'us-central1',
      } as any);

      mockUserService.listUsers.mockResolvedValue([
        { username: 'user1' },
        { username: 'user2' },
        { username: 'user3' },
      ] as any);

      mockUserService.deleteUser.mockResolvedValue(undefined);
    });

    it('should delete all users successfully', async () => {
      await processInstanceDeleted(mockJob, mockFastify);

      expect(mockOmnistrateRepo.getInstance).toHaveBeenCalledWith('test-instance-id');
      expect(mockUserService.listUsers).toHaveBeenCalledWith(
        'test-instance-id',
        'gcp',
        'test-cluster',
        'us-central1',
      );
      expect(mockUserService.deleteUser).toHaveBeenCalledTimes(3);
      expect(mockLogger.info).toHaveBeenCalledWith({ deletedCount: 3 }, 'User deletion completed');
    });

    it('should handle partial deletion failures', async () => {
      mockUserService.deleteUser
        .mockResolvedValueOnce(undefined) // First user succeeds
        .mockRejectedValueOnce(new Error('Failed to delete')) // Second user fails
        .mockResolvedValueOnce(undefined); // Third user succeeds

      await processInstanceDeleted(mockJob, mockFastify);

      expect(mockUserService.deleteUser).toHaveBeenCalledTimes(3);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        { deletedCount: 2, failedCount: 1 },
        'Some users failed to delete, but continuing',
      );
      expect(mockLogger.info).toHaveBeenCalledWith({ deletedCount: 2 }, 'User deletion completed');
    });

    it('should handle instance already deleted', async () => {
      mockOmnistrateRepo.getInstance.mockResolvedValue(null);

      await processInstanceDeleted(mockJob, mockFastify);

      expect(mockUserService.listUsers).not.toHaveBeenCalled();
      expect(mockUserService.deleteUser).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith('Instance not found, may already be deleted');
    });

    it('should handle instance fetch error', async () => {
      mockOmnistrateRepo.getInstance.mockRejectedValue(new Error('Instance not found'));

      await processInstanceDeleted(mockJob, mockFastify);

      expect(mockUserService.listUsers).not.toHaveBeenCalled();
      expect(mockUserService.deleteUser).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        { error: 'Instance not found' },
        'Instance not found in Omnistrate, may already be deleted',
      );
    });

    it('should handle missing instance metadata', async () => {
      mockOmnistrateRepo.getInstance.mockResolvedValue({
        instanceId: 'test-instance-id',
        cloudProvider: null,
        clusterId: null,
        region: null,
      } as any);

      await processInstanceDeleted(mockJob, mockFastify);

      expect(mockUserService.listUsers).not.toHaveBeenCalled();
      expect(mockUserService.deleteUser).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({ cloudProvider: null }),
        'Missing required instance details',
      );
    });

    it('should handle users list error', async () => {
      mockUserService.listUsers.mockRejectedValue(new Error('Cannot list users'));

      await processInstanceDeleted(mockJob, mockFastify);

      expect(mockUserService.deleteUser).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        { error: 'Cannot list users' },
        'Could not list users, may already be deleted',
      );
    });

    it('should continue deletion even if all users fail', async () => {
      mockUserService.deleteUser.mockRejectedValue(new Error('Failed to delete'));

      await processInstanceDeleted(mockJob, mockFastify);

      expect(mockUserService.deleteUser).toHaveBeenCalledTimes(3);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        { deletedCount: 0, failedCount: 3 },
        'Some users failed to delete, but continuing',
      );
      expect(mockLogger.info).toHaveBeenCalledWith({ deletedCount: 0 }, 'User deletion completed');
    });
  });

  describe('error handling', () => {
    it('should throw error if job exceeded 24 hour timeout', async () => {
      mockJob.data.timestamp = Date.now() - JOB_TIMEOUT_MS - 1000;

      await expect(processInstanceDeleted(mockJob, mockFastify)).rejects.toThrow(
        'Job exceeded 24 hour timeout',
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        { elapsedTime: expect.any(Number) },
        'Job exceeded 24 hour timeout, failing permanently',
      );
    });

    it('should not retry on generic errors (deletion is lenient)', async () => {
      mockOmnistrateRepo.getInstance.mockResolvedValue({
        instanceId: 'test-instance-id',
        cloudProvider: 'gcp',
        clusterId: 'test-cluster',
        region: 'us-central1',
      } as any);

      mockUserService.listUsers.mockRejectedValue(new Error('Catastrophic error'));

      // Should not throw - deletion jobs are lenient
      await processInstanceDeleted(mockJob, mockFastify);

      // The processor handles listUsers errors gracefully and returns early
      expect(mockLogger.warn).toHaveBeenCalledWith(
        { error: 'Catastrophic error' },
        'Could not list users, may already be deleted',
      );
    });
  });

  describe('logging', () => {
    it('should create child logger with job context', async () => {
      mockOmnistrateRepo.getInstance.mockResolvedValue(null);

      await processInstanceDeleted(mockJob, mockFastify);

      expect(mockLogger.child).toHaveBeenCalledWith({
        jobId: 'test-job-id',
        instanceId: 'test-instance-id',
        subscriptionId: 'test-subscription-id',
      });
    });

    it('should log deletion progress', async () => {
      mockOmnistrateRepo.getInstance.mockResolvedValue({
        instanceId: 'test-instance-id',
        cloudProvider: 'gcp',
        clusterId: 'test-cluster',
        region: 'us-central1',
      } as any);

      mockUserService.listUsers.mockResolvedValue([{ username: 'user1' }] as any);
      mockUserService.deleteUser.mockResolvedValue(undefined);

      await processInstanceDeleted(mockJob, mockFastify);

      expect(mockLogger.info).toHaveBeenCalledWith({ userCount: 1 }, 'Deleting all users for instance');
      expect(mockLogger.info).toHaveBeenCalledWith({ username: '***' }, 'User deleted successfully');
      expect(mockLogger.info).toHaveBeenCalledWith({ deletedCount: 1 }, 'User deletion completed');
    });
  });
});
