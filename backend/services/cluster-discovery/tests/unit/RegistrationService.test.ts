import { RegistrationService } from '../../src/services/RegistrationService';
import {
  createClusterSecret,
  deleteClusterSecret,
  listClusterSecrets,
  updateClusterSecret,
} from '../../src/integrations/argocd';
import { mockGCPCluster, mockAWSCluster } from '../__mocks__/fixtures';

// Mock the ArgoCD integration
jest.mock('../../src/integrations/argocd');

describe('RegistrationService', () => {
  let service: RegistrationService;

  beforeEach(() => {
    service = new RegistrationService();
    jest.clearAllMocks();
  });

  describe('registerOrUpdateCluster', () => {
    it('should create a new cluster secret', async () => {
      // Arrange
      const mockCreateSecret = jest.mocked(createClusterSecret);
      mockCreateSecret.mockResolvedValue();

      // Act
      await service.registerOrUpdateCluster(mockGCPCluster);

      // Assert
      expect(mockCreateSecret).toHaveBeenCalledWith(mockGCPCluster);
      expect(mockCreateSecret).toHaveBeenCalledTimes(1);
    });

    it('should update existing cluster secret if labels changed', async () => {
      // Arrange
      const mockUpdateSecret = jest.mocked(updateClusterSecret);
      mockUpdateSecret.mockResolvedValue();

      const existingSecret = {
        name: mockGCPCluster.name,
        labels: { 'old-label': 'value' },
      };

      // Act
      await service.registerOrUpdateCluster(mockGCPCluster, existingSecret);

      // Assert
      expect(mockUpdateSecret).toHaveBeenCalledWith(existingSecret.name, mockGCPCluster);
    });
  });

  describe('deregisterCluster', () => {
    it('should delete a cluster secret when shouldDelete is true', async () => {
      // Arrange
      const mockDeleteSecret = jest.mocked(deleteClusterSecret);
      mockDeleteSecret.mockResolvedValue();

      // Act
      await service.deregisterCluster(mockGCPCluster.name, true);

      // Assert
      expect(mockDeleteSecret).toHaveBeenCalledWith(mockGCPCluster.name);
      expect(mockDeleteSecret).toHaveBeenCalledTimes(1);
    });

    it('should not delete when shouldDelete is false', async () => {
      // Arrange
      const mockDeleteSecret = jest.mocked(deleteClusterSecret);

      // Act
      await service.deregisterCluster('non-existent-cluster', false);

      // Assert
      expect(mockDeleteSecret).not.toHaveBeenCalled();
    });
  });

  describe('getExistingSecrets', () => {
    it('should return list of existing secrets', async () => {
      // Arrange
      const mockListSecrets = jest.mocked(listClusterSecrets);
      const mockSecrets = [
        { name: mockGCPCluster.name, labels: {} },
        { name: mockAWSCluster.name, labels: {} },
      ];
      mockListSecrets.mockResolvedValue(mockSecrets);

      // Act
      const result = await service.getExistingSecrets();

      // Assert
      expect(result).toEqual(mockSecrets);
      expect(mockListSecrets).toHaveBeenCalledTimes(1);
    });

    it('should return empty array if no secrets exist', async () => {
      // Arrange
      const mockListSecrets = jest.mocked(listClusterSecrets);
      mockListSecrets.mockResolvedValue([]);

      // Act
      const result = await service.getExistingSecrets();

      // Assert
      expect(result).toEqual([]);
    });
  });
});
