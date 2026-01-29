import { DiscoveryService } from '../../src/services/DiscoveryService';
import { discoverGCPClusters } from '../../src/providers/gcp/discovery';
import { discoverAWSClusters } from '../../src/providers/aws/discovery';
import { discoverBYOAClusters } from '../../src/providers/omnistrate/client';
import { mockGCPCluster, mockAWSCluster, mockBYOACluster } from '../__mocks__/fixtures';

// Mock the provider discovery functions
jest.mock('../../src/providers/gcp/discovery');
jest.mock('../../src/providers/aws/discovery');
jest.mock('../../src/providers/omnistrate/client');

describe('DiscoveryService', () => {
  let service: DiscoveryService;

  beforeEach(() => {
    service = new DiscoveryService();
    jest.clearAllMocks();
  });

  describe('discoverAllClusters', () => {
    it('should discover clusters from all providers in parallel', async () => {
      // Arrange
      const mockGCPDiscovery = jest.mocked(discoverGCPClusters);
      const mockAWSDiscovery = jest.mocked(discoverAWSClusters);
      const mockBYOADiscovery = jest.mocked(discoverBYOAClusters);

      mockGCPDiscovery.mockResolvedValue({ clusters: [mockGCPCluster] });
      mockAWSDiscovery.mockResolvedValue({ 
        clusters: [mockAWSCluster],
        credentials: { accessKeyId: 'test', secretAccessKey: 'test', sessionToken: 'test' }
      });
      mockBYOADiscovery.mockResolvedValue({ clusters: [mockBYOACluster] });

      // Act
      const result = await service.discoverAllClusters();

      // Assert
      expect(result.gcpClusters).toHaveLength(1);
      expect(result.awsClusters).toHaveLength(1);
      expect(result.byoaClusters).toHaveLength(1);
      expect(result.gcpClusters[0]).toMatchObject({ name: mockGCPCluster.name, cloud: 'gcp' });
      expect(result.awsClusters[0]).toMatchObject({ name: mockAWSCluster.name, cloud: 'aws' });
      expect(result.byoaClusters[0]).toMatchObject({ name: mockBYOACluster.name, hostMode: 'byoa' });
      expect(mockGCPDiscovery).toHaveBeenCalledTimes(1);
      expect(mockAWSDiscovery).toHaveBeenCalledTimes(1);
      expect(mockBYOADiscovery).toHaveBeenCalledTimes(1);
    });

    it('should handle partial failures gracefully', async () => {
      // Arrange
      const mockGCPDiscovery = jest.mocked(discoverGCPClusters);
      const mockAWSDiscovery = jest.mocked(discoverAWSClusters);
      const mockBYOADiscovery = jest.mocked(discoverBYOAClusters);

      mockGCPDiscovery.mockResolvedValue({ clusters: [mockGCPCluster] });
      mockAWSDiscovery.mockRejectedValue(new Error('AWS API Error'));
      mockBYOADiscovery.mockResolvedValue({ clusters: [mockBYOACluster] });

      // Act
      const result = await service.discoverAllClusters();

      // Assert
      expect(result.gcpClusters).toHaveLength(1);
      expect(result.awsClusters).toHaveLength(0); // Failed, returns empty array
      expect(result.byoaClusters).toHaveLength(1);
    });

    it('should return empty arrays if all providers fail', async () => {
      // Arrange
      const mockGCPDiscovery = jest.mocked(discoverGCPClusters);
      const mockAWSDiscovery = jest.mocked(discoverAWSClusters);
      const mockBYOADiscovery = jest.mocked(discoverBYOAClusters);

      mockGCPDiscovery.mockRejectedValue(new Error('GCP API Error'));
      mockAWSDiscovery.mockRejectedValue(new Error('AWS API Error'));
      mockBYOADiscovery.mockRejectedValue(new Error('Omnistrate API Error'));

      // Act
      const result = await service.discoverAllClusters();

      // Assert
      expect(result.gcpClusters).toHaveLength(0);
      expect(result.awsClusters).toHaveLength(0);
      expect(result.byoaClusters).toHaveLength(0);
    });

    it('should handle empty results from providers', async () => {
      // Arrange
      const mockGCPDiscovery = jest.mocked(discoverGCPClusters);
      const mockAWSDiscovery = jest.mocked(discoverAWSClusters);
      const mockBYOADiscovery = jest.mocked(discoverBYOAClusters);

      mockGCPDiscovery.mockResolvedValue({ clusters: [] });
      mockAWSDiscovery.mockResolvedValue({ 
        clusters: [],
        credentials: { accessKeyId: 'test', secretAccessKey: 'test', sessionToken: 'test' }
      });
      mockBYOADiscovery.mockResolvedValue({ clusters: [] });

      // Act
      const result = await service.discoverAllClusters();

      // Assert
      expect(result.gcpClusters).toHaveLength(0);
      expect(result.awsClusters).toHaveLength(0);
      expect(result.byoaClusters).toHaveLength(0);
    });
  });
});
