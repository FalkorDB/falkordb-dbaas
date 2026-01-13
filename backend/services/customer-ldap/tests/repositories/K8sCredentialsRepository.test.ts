import { K8sCredentialsOmnistrateRepository } from '../../src/repositories/k8s-credentials/K8sCredentialsOmnistrateRepository';
import { OmnistrateClient } from '../../src/repositories/omnistrate/OmnistrateClient';
import pino from 'pino';

describe('K8sCredentialsRepository', () => {
  let repository: K8sCredentialsOmnistrateRepository;
  let omnistrateClient: OmnistrateClient;
  let logger: pino.Logger;
  let mockGet: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    logger = pino({ level: 'silent' });
    
    // Create a mock client
    mockGet = jest.fn();
    omnistrateClient = {
      client: {
        get: mockGet,
      },
    } as any;
    
    repository = new K8sCredentialsOmnistrateRepository(omnistrateClient, { logger });
  });

  describe('getKubeConfig', () => {
    it('should throw error when clusterId is not provided', async () => {
      await expect(repository.getKubeConfig('gcp', '', 'us-central1')).rejects.toThrow(
        'K8sCredentialsRepository: Cluster ID is required',
      );
    });

    it('should successfully create kubeconfig with service account token for GCP', async () => {
      const mockResponse = {
        data: {
          apiServerEndpoint: 'https://api.test-cluster.com',
          caDataBase64: 'base64-ca-data',
          id: 'cluster-id-123',
          serviceAccountToken: 'base64-token',
          userName: 'omnistrate-user',
        },
      };

      mockGet.mockResolvedValue(mockResponse);

      const kubeConfig = await repository.getKubeConfig('gcp', 'c-hcabc123def456', 'us-central1');

      expect(kubeConfig).toBeDefined();
      expect(mockGet).toHaveBeenCalledWith('/2022-09-01-00/fleet/host-cluster/hc-abc123def456/kubeconfig?role=cluster-admin');

      // Verify kubeconfig structure
      const clusters = kubeConfig.getClusters();
      expect(clusters).toHaveLength(1);
      expect(clusters[0].server).toBe('https://api.test-cluster.com/');

      const users = kubeConfig.getUsers();
      expect(users).toHaveLength(1);
      expect(users[0].name).toBe('omnistrate-user');
    });

    it('should successfully create kubeconfig with client certificates for AWS', async () => {
      const mockResponse = {
        data: {
          apiServerEndpoint: 'https://api.test-eks-cluster.com',
          caDataBase64: 'base64-ca-data',
          clientCertificateDataBase64: 'base64-cert',
          clientKeyDataBase64: 'base64-key',
          id: 'eks-cluster-id',
          userName: 'omnistrate-user',
        },
      };

      mockGet.mockResolvedValue(mockResponse);

      const kubeConfig = await repository.getKubeConfig('aws', 'hc-123456', 'us-west-2');

      expect(kubeConfig).toBeDefined();
      expect(mockGet).toHaveBeenCalledWith('/2022-09-01-00/fleet/host-cluster/hc-123456/kubeconfig?role=cluster-admin');

      const users = kubeConfig.getUsers();
      expect(users).toHaveLength(1);
      expect(users[0].name).toBe('omnistrate-user');
    });

    it('should throw error when API call fails', async () => {
      mockGet.mockRejectedValue(new Error('API Error'));

      await expect(repository.getKubeConfig('gcp', 'c-test123', 'us-central1')).rejects.toThrow(
        'Failed to retrieve kubeconfig from Omnistrate',
      );
    });

    it('should throw error when apiServerEndpoint is missing', async () => {
      const mockResponse = {
        data: {
          caDataBase64: 'base64-ca-data',
          id: 'cluster-id',
          serviceAccountToken: 'base64-token',
          userName: 'omnistrate-user',
        },
      };

      mockGet.mockResolvedValue(mockResponse);

      await expect(repository.getKubeConfig('gcp', 'c-test123', 'us-central1')).rejects.toThrow(
        'Missing apiServerEndpoint in kubeconfig response',
      );
    });

    it('should throw error when no authentication method is available', async () => {
      const mockResponse = {
        data: {
          apiServerEndpoint: 'https://api.test-cluster.com',
          caDataBase64: 'base64-ca-data',
          id: 'cluster-id',
          userName: 'omnistrate-user',
          // No serviceAccountToken and no client certificates
        },
      };

      mockGet.mockResolvedValue(mockResponse);

      await expect(repository.getKubeConfig('gcp', 'c-test123', 'us-central1')).rejects.toThrow(
        'No valid authentication method found in kubeconfig response',
      );
    });

    it('should use clusterId as-is for AWS clusters', async () => {
      const mockResponse = {
        data: {
          apiServerEndpoint: 'https://api.test-cluster.com',
          caDataBase64: 'base64-ca-data',
          id: 'cluster-id',
          serviceAccountToken: 'base64-token',
          userName: 'omnistrate-user',
        },
      };

      mockGet.mockResolvedValue(mockResponse);

      await repository.getKubeConfig('aws', 'my-eks-cluster', 'us-west-2');

      expect(mockGet).toHaveBeenCalledWith('/2022-09-01-00/fleet/host-cluster/my-eks-cluster/kubeconfig?role=cluster-admin');
    });
  });
});
