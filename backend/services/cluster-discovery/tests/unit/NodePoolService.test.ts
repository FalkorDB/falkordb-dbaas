import { NodePoolService } from '../../src/services/NodePoolService';
import { createObservabilityNodePool } from '../../src/providers';
import { mockGCPCluster, mockAWSCluster, mockBYOACluster } from '../__mocks__/fixtures';

// Mock the node pool creation
jest.mock('../../src/providers');

describe('NodePoolService', () => {
  let service: NodePoolService;

  beforeEach(() => {
    service = new NodePoolService();
    jest.clearAllMocks();
  });

  describe('createObservabilityNodePoolIfNeeded', () => {
    it('should create node pool for managed GCP cluster', async () => {
      // Arrange
      const mockCreateNodePool = jest.mocked(createObservabilityNodePool);
      mockCreateNodePool.mockResolvedValue();

      // Act
      await service.createObservabilityNodePoolIfNeeded(mockGCPCluster);

      // Assert
      expect(mockCreateNodePool).toHaveBeenCalledWith(mockGCPCluster);
      expect(mockCreateNodePool).toHaveBeenCalledTimes(1);
    });

    it('should create node pool for managed AWS cluster', async () => {
      // Arrange
      const mockCreateNodePool = jest.mocked(createObservabilityNodePool);
      mockCreateNodePool.mockResolvedValue();

      // Act
      await service.createObservabilityNodePoolIfNeeded(mockAWSCluster);

      // Assert
      expect(mockCreateNodePool).toHaveBeenCalledWith(mockAWSCluster);
      expect(mockCreateNodePool).toHaveBeenCalledTimes(1);
    });

    it('should create node pool for BYOA cluster', async () => {
      // Arrange
      const mockCreateNodePool = jest.mocked(createObservabilityNodePool);
      mockCreateNodePool.mockResolvedValue();

      // Act
      await service.createObservabilityNodePoolIfNeeded(mockBYOACluster);

      // Assert
      expect(mockCreateNodePool).toHaveBeenCalledWith(mockBYOACluster);
      expect(mockCreateNodePool).toHaveBeenCalledTimes(1);
    });

    it('should handle node pool creation errors gracefully', async () => {
      // Arrange
      const mockCreateNodePool = jest.mocked(createObservabilityNodePool);
      mockCreateNodePool.mockRejectedValue(new Error('Node pool creation failed'));

      // Act & Assert - should not throw
      await expect(
        service.createObservabilityNodePoolIfNeeded(mockGCPCluster)
      ).resolves.not.toThrow();

      expect(mockCreateNodePool).toHaveBeenCalledWith(mockGCPCluster);
    });

    it('should not throw if node pool already exists', async () => {
      // Arrange
      const mockCreateNodePool = jest.mocked(createObservabilityNodePool);
      mockCreateNodePool.mockRejectedValue(
        new Error('Node pool observability already exists')
      );

      // Act & Assert
      await expect(
        service.createObservabilityNodePoolIfNeeded(mockGCPCluster)
      ).resolves.not.toThrow();
    });
  });
});
