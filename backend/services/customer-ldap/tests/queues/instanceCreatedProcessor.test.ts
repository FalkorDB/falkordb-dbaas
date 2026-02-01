import { processInstanceCreated } from '../../src/queues/processors/instanceCreatedProcessor';
import { Job } from 'bullmq';
import { FastifyInstance } from 'fastify';
import { IOmnistrateRepository } from '../../src/repositories/omnistrate/IOmnistrateRepository';
import { IK8sRepository } from '../../src/repositories/k8s/IK8sRepository';
import { IK8sCredentialsRepository } from '../../src/repositories/k8s-credentials/IK8sCredentialsRepository';
import { ILdapRepository } from '../../src/repositories/ldap/ILdapRepository';
import { IConnectionCacheRepository } from '../../src/repositories/connection-cache/IConnectionCacheRepository';
import { UserService } from '../../src/services/UserService';
import { ALLOWED_ACL } from '../../src/constants';
import { JOB_TIMEOUT_MS } from '../../src/queues/config';

jest.mock('../../src/services/UserService');

describe('processInstanceCreated', () => {
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
      createUser: jest.fn(),
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
        resultParams: {
          falkordbUser: 'test-user',
          falkordbPassword: 'test-password',
        },
      } as any);
    });

    it('should process job successfully', async () => {
      await processInstanceCreated(mockJob, mockFastify);

      expect(mockOmnistrateRepo.getInstance).toHaveBeenCalledWith('test-instance-id');
      expect(mockUserService.createUser).toHaveBeenCalledWith(
        'test-instance-id',
        'gcp',
        'test-cluster',
        'us-central1',
        {
          username: 'test-user',
          password: 'test-password',
          acl: `~* ${ALLOWED_ACL}`,
        },
      );
      expect(mockLogger.info).toHaveBeenCalledWith({ username: '***' }, 'User created successfully');
    });

    it('should handle user already exists (idempotency)', async () => {
      mockUserService.createUser.mockRejectedValue(new Error('User already exists'));

      await processInstanceCreated(mockJob, mockFastify);

      expect(mockLogger.info).toHaveBeenCalledWith('User already exists - job is idempotent');
    });

    it('should handle 409 conflict (idempotency)', async () => {
      mockUserService.createUser.mockRejectedValue(new Error('409 Conflict'));

      await processInstanceCreated(mockJob, mockFastify);

      expect(mockLogger.info).toHaveBeenCalledWith('User already exists - job is idempotent');
    });
  });

  describe('error handling', () => {
    it('should throw error if job exceeded 24 hour timeout', async () => {
      mockJob.data.timestamp = Date.now() - JOB_TIMEOUT_MS - 1000;

      await expect(processInstanceCreated(mockJob, mockFastify)).rejects.toThrow(
        'Job exceeded 24 hour timeout',
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        { elapsedTime: expect.any(Number) },
        'Job exceeded 24 hour timeout, failing permanently',
      );
    });

    it('should throw error if instance not found', async () => {
      mockOmnistrateRepo.getInstance.mockResolvedValue(null);

      await expect(processInstanceCreated(mockJob, mockFastify)).rejects.toThrow(
        'Instance test-instance-id not found in Omnistrate',
      );
      expect(mockLogger.error).toHaveBeenCalledWith('Instance not found in Omnistrate');
    });

    it('should throw error if missing FalkorDB credentials', async () => {
      mockOmnistrateRepo.getInstance.mockResolvedValue({
        instanceId: 'test-instance-id',
        cloudProvider: 'gcp',
        clusterId: 'test-cluster',
        region: 'us-central1',
        resultParams: {},
      } as any);

      await expect(processInstanceCreated(mockJob, mockFastify)).rejects.toThrow(
        'Missing falkordbUsername or falkordbPassword',
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        { hasResultParams: true },
        'Missing FalkorDB credentials in resultParams',
      );
    });

    it('should throw error if missing cloud provider details', async () => {
      mockOmnistrateRepo.getInstance.mockResolvedValue({
        instanceId: 'test-instance-id',
        cloudProvider: null,
        clusterId: 'test-cluster',
        region: 'us-central1',
        resultParams: {
          falkordbUser: 'test-user',
          falkordbPassword: 'test-password',
        },
      } as any);

      await expect(processInstanceCreated(mockJob, mockFastify)).rejects.toThrow(
        'Missing cloud_provider, cluster name, or region',
      );
    });

    it('should throw error on rate limiting', async () => {
      mockOmnistrateRepo.getInstance.mockResolvedValue({
        instanceId: 'test-instance-id',
        cloudProvider: 'gcp',
        clusterId: 'test-cluster',
        region: 'us-central1',
        resultParams: {
          falkordbUser: 'test-user',
          falkordbPassword: 'test-password',
        },
      } as any);

      mockUserService.createUser.mockRejectedValue(new Error('429 Rate limited'));

      await expect(processInstanceCreated(mockJob, mockFastify)).rejects.toThrow('LDAP server rate limit reached');
      expect(mockLogger.warn).toHaveBeenCalledWith('Rate limited by LDAP server');
    });

    it('should throw error on generic failure', async () => {
      mockOmnistrateRepo.getInstance.mockResolvedValue({
        instanceId: 'test-instance-id',
        cloudProvider: 'gcp',
        clusterId: 'test-cluster',
        region: 'us-central1',
        resultParams: {
          falkordbUser: 'test-user',
          falkordbPassword: 'test-password',
        },
      } as any);

      mockUserService.createUser.mockRejectedValue(new Error('Generic error'));

      await expect(processInstanceCreated(mockJob, mockFastify)).rejects.toThrow(
        'Failed to process instance created',
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        { error: expect.any(String) },
        'Error processing instance created job',
      );
    });
  });

  describe('logging', () => {
    it('should create child logger with job context', async () => {
      mockOmnistrateRepo.getInstance.mockResolvedValue({
        instanceId: 'test-instance-id',
        cloudProvider: 'gcp',
        clusterId: 'test-cluster',
        region: 'us-central1',
        resultParams: {
          falkordbUser: 'test-user',
          falkordbPassword: 'test-password',
        },
      } as any);

      await processInstanceCreated(mockJob, mockFastify);

      expect(mockLogger.child).toHaveBeenCalledWith({
        jobId: 'test-job-id',
        instanceId: 'test-instance-id',
        subscriptionId: 'test-subscription-id',
      });
    });
  });
});
