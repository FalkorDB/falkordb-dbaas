import { SecretManagementService } from '../../src/services/SecretManagementService';
import { createTargetClusterPagerDutySecret } from '../../src/secrets/pagerduty';
import { createOrUpdateTargetClusterVMUserSecretJob } from '../../src/secrets/vmuser';
import { mockGCPCluster, mockAWSCluster } from '../__mocks__/fixtures';

jest.mock('../../src/secrets/pagerduty');
jest.mock('../../src/secrets/vmuser');

describe('SecretManagementService', () => {
  let service: SecretManagementService;

  beforeEach(() => {
    service = new SecretManagementService();
    jest.clearAllMocks();
  });

  describe('createPagerDutySecret', () => {
    it('should create PagerDuty secret for a cluster', async () => {
      // Arrange
      const mockCreatePagerDuty = jest.mocked(createTargetClusterPagerDutySecret);
      mockCreatePagerDuty.mockResolvedValue();

      // Act
      await service.createPagerDutySecret(mockGCPCluster);

      // Assert
      expect(mockCreatePagerDuty).toHaveBeenCalledWith(mockGCPCluster);
      expect(mockCreatePagerDuty).toHaveBeenCalledTimes(1);
    });

    it('should handle PagerDuty secret creation failure gracefully', async () => {
      // Arrange
      const mockCreatePagerDuty = jest.mocked(createTargetClusterPagerDutySecret);
      mockCreatePagerDuty.mockRejectedValue(new Error('PagerDuty API error'));

      // Act & Assert - should not throw, errors are logged only
      await expect(
        service.createPagerDutySecret(mockGCPCluster)
      ).resolves.not.toThrow();
    });
  });

  describe('createOrUpdateVMUserSecret', () => {
    it('should create/update VMUser secret for a cluster', async () => {
      // Arrange
      const mockCreateVMUser = jest.mocked(createOrUpdateTargetClusterVMUserSecretJob);
      mockCreateVMUser.mockResolvedValue();

      // Act
      await service.createOrUpdateVMUserSecret(mockGCPCluster);

      // Assert
      expect(mockCreateVMUser).toHaveBeenCalledWith(mockGCPCluster);
      expect(mockCreateVMUser).toHaveBeenCalledTimes(1);
    });

    it('should handle VMUser secret creation failure gracefully', async () => {
      // Arrange
      const mockCreateVMUser = jest.mocked(createOrUpdateTargetClusterVMUserSecretJob);
      mockCreateVMUser.mockRejectedValue(new Error('K8s API error'));

      // Act & Assert - should not throw, errors are logged only
      await expect(
        service.createOrUpdateVMUserSecret(mockAWSCluster)
      ).resolves.not.toThrow();
    });

    it('should work with different cluster types', async () => {
      // Arrange
      const mockCreateVMUser = jest.mocked(createOrUpdateTargetClusterVMUserSecretJob);
      mockCreateVMUser.mockResolvedValue();

      // Act
      await service.createOrUpdateVMUserSecret(mockAWSCluster);

      // Assert
      expect(mockCreateVMUser).toHaveBeenCalledWith(mockAWSCluster);
    });
  });
});
