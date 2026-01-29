import { handleCellDeletion } from '../../src/services/CellDeletionService';
import { OmnistrateClient } from '../../src/providers/omnistrate/client';
import { deleteObservabilityNodePool } from '../../src/providers';

// Mock dependencies
jest.mock('../../src/providers/omnistrate/client');
jest.mock('../../src/providers');

describe('CellDeletionService', () => {
  let mockOmnistrateClient: jest.Mocked<OmnistrateClient>;

  beforeEach(() => {
    // Create mock instance
    mockOmnistrateClient = {
      getDeploymentCell: jest.fn(),
      getBYOCCloudAccounts: jest.fn(),
      getDeploymentCellCredentials: jest.fn(),
    } as any;

    // Mock OmnistrateClient constructor
    (OmnistrateClient as jest.MockedClass<typeof OmnistrateClient>).mockImplementation(() => mockOmnistrateClient);

    jest.clearAllMocks();
  });

  describe('handleCellDeletion', () => {
    describe('BYOA clusters', () => {
      it('should delete observability node pool for BYOA GCP cluster', async () => {
        // Arrange
        const deploymentCellId = 'cell-123-456-789';
        const mockDeploymentCell = {
          id: deploymentCellId,
          cloudProvider: 'gcp' as const,
          region: 'us-central1',
          modelType: 'BYOA',
          status: 'RUNNING',
          destinationAccountID: 'gcp-project-123',
        };

        const mockCloudAccount = {
          id: 'account-1',
          cloudProvider: 'gcp' as const,
          cloudAccountId: 'gcp-project-123',
          cloudAccountNumber: '123456789',
          organizationId: 'org-123',
        };

        const mockCredentials = {
          apiServerEndpoint: 'https://k8s.example.com',
          caDataBase64: 'ca-data',
          clientCertificateDataBase64: 'cert-data',
          clientKeyDataBase64: 'key-data',
          serviceAccountToken: 'token-123',
          id: 'cred-1',
          userName: 'admin',
        };

        mockOmnistrateClient.getDeploymentCell.mockResolvedValue(mockDeploymentCell);
        mockOmnistrateClient.getBYOCCloudAccounts.mockResolvedValue([mockCloudAccount]);
        mockOmnistrateClient.getDeploymentCellCredentials.mockResolvedValue(mockCredentials);
        (deleteObservabilityNodePool as jest.Mock).mockResolvedValue(undefined);

        // Act
        await handleCellDeletion(deploymentCellId);

        // Assert
        expect(mockOmnistrateClient.getDeploymentCell).toHaveBeenCalledWith(deploymentCellId);
        expect(mockOmnistrateClient.getBYOCCloudAccounts).toHaveBeenCalled();
        expect(mockOmnistrateClient.getDeploymentCellCredentials).toHaveBeenCalledWith(deploymentCellId);
        expect(deleteObservabilityNodePool).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'c-cell123456789',
            cloud: 'gcp',
            region: 'us-central1',
            hostMode: 'byoa',
            destinationAccountID: 'gcp-project-123',
            endpoint: 'https://k8s.example.com',
          })
        );
      });

      it('should delete observability node pool for BYOA AWS cluster', async () => {
        // Arrange
        const deploymentCellId = 'aws-cell-abc-def';
        const mockDeploymentCell = {
          id: deploymentCellId,
          cloudProvider: 'aws' as const,
          region: 'us-east-1',
          modelType: 'BYOA',
          status: 'RUNNING',
          destinationAccountID: '123456789012',
        };

        const mockCloudAccount = {
          id: 'account-2',
          cloudProvider: 'aws' as const,
          cloudAccountId: '123456789012',
          cloudAccountNumber: '123456789012',
          organizationId: 'org-456',
        };

        const mockCredentials = {
          apiServerEndpoint: 'https://eks.amazonaws.com',
          caDataBase64: 'ca-data',
          clientCertificateDataBase64: 'cert-data',
          clientKeyDataBase64: 'key-data',
          serviceAccountToken: 'token-456',
          id: 'cred-2',
          userName: 'admin',
        };

        mockOmnistrateClient.getDeploymentCell.mockResolvedValue(mockDeploymentCell);
        mockOmnistrateClient.getBYOCCloudAccounts.mockResolvedValue([mockCloudAccount]);
        mockOmnistrateClient.getDeploymentCellCredentials.mockResolvedValue(mockCredentials);
        (deleteObservabilityNodePool as jest.Mock).mockResolvedValue(undefined);

        // Act
        await handleCellDeletion(deploymentCellId);

        // Assert
        expect(deleteObservabilityNodePool).toHaveBeenCalledWith(
          expect.objectContaining({
            name: deploymentCellId,
            cloud: 'aws',
            region: 'us-east-1',
            hostMode: 'byoa',
            destinationAccountID: '123456789012',
          })
        );
      });

      it('should handle missing cloud account gracefully', async () => {
        // Arrange
        const deploymentCellId = 'cell-no-account';
        const mockDeploymentCell = {
          id: deploymentCellId,
          cloudProvider: 'gcp' as const,
          region: 'us-west1',
          modelType: 'BYOA',
          status: 'RUNNING',
          destinationAccountID: 'unknown-project',
        };

        const mockCredentials = {
          apiServerEndpoint: 'https://k8s.example.com',
          caDataBase64: 'ca-data',
          clientCertificateDataBase64: 'cert-data',
          clientKeyDataBase64: 'key-data',
          serviceAccountToken: 'token-789',
          id: 'cred-3',
          userName: 'admin',
        };

        mockOmnistrateClient.getDeploymentCell.mockResolvedValue(mockDeploymentCell);
        mockOmnistrateClient.getBYOCCloudAccounts.mockResolvedValue([]);
        mockOmnistrateClient.getDeploymentCellCredentials.mockResolvedValue(mockCredentials);
        (deleteObservabilityNodePool as jest.Mock).mockResolvedValue(undefined);

        // Act
        await handleCellDeletion(deploymentCellId);

        // Assert - should still proceed with deletion
        expect(deleteObservabilityNodePool).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'c-cellnoaccount',
            destinationAccountNumber: undefined,
            organizationId: undefined,
          })
        );
      });
    });

    describe('Managed clusters', () => {
      it('should delete observability node pool for managed GCP cluster', async () => {
        // Arrange
        const deploymentCellId = 'managed-gcp-cell';
        const mockDeploymentCell = {
          id: deploymentCellId,
          cloudProvider: 'gcp' as const,
          region: 'europe-west1',
          modelType: 'CUSTOMER_HOSTED',
          status: 'RUNNING',
          destinationAccountID: 'managed-project',
        };

        mockOmnistrateClient.getDeploymentCell.mockResolvedValue(mockDeploymentCell);
        (deleteObservabilityNodePool as jest.Mock).mockResolvedValue(undefined);

        // Act
        await handleCellDeletion(deploymentCellId);

        // Assert
        expect(mockOmnistrateClient.getBYOCCloudAccounts).not.toHaveBeenCalled();
        expect(mockOmnistrateClient.getDeploymentCellCredentials).not.toHaveBeenCalled();
        expect(deleteObservabilityNodePool).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'c-managedgcpcell',
            cloud: 'gcp',
            region: 'europe-west1',
            hostMode: 'managed',
          })
        );
      });

      it('should delete observability node pool for managed AWS cluster', async () => {
        // Arrange
        const deploymentCellId = 'managed-aws-cell';
        const mockDeploymentCell = {
          id: deploymentCellId,
          cloudProvider: 'aws' as const,
          region: 'ap-southeast-1',
          modelType: 'CUSTOMER_HOSTED',
          status: 'RUNNING',
          destinationAccountID: 'managed-account',
        };

        mockOmnistrateClient.getDeploymentCell.mockResolvedValue(mockDeploymentCell);
        (deleteObservabilityNodePool as jest.Mock).mockResolvedValue(undefined);

        // Act
        await handleCellDeletion(deploymentCellId);

        // Assert
        expect(deleteObservabilityNodePool).toHaveBeenCalledWith(
          expect.objectContaining({
            name: deploymentCellId,
            cloud: 'aws',
            region: 'ap-southeast-1',
            hostMode: 'managed',
          })
        );
      });
    });

    describe('Error handling', () => {
      it('should throw error when deployment cell is not found', async () => {
        // Arrange
        const deploymentCellId = 'non-existent-cell';
        mockOmnistrateClient.getDeploymentCell.mockResolvedValue(null);

        // Act & Assert
        await expect(handleCellDeletion(deploymentCellId)).rejects.toThrow(
          `Deployment cell ${deploymentCellId} not found`
        );
        expect(deleteObservabilityNodePool).not.toHaveBeenCalled();
      });

      it('should propagate errors from deleteObservabilityNodePool', async () => {
        // Arrange
        const deploymentCellId = 'error-cell';
        const mockDeploymentCell = {
          id: deploymentCellId,
          cloudProvider: 'gcp' as const,
          region: 'us-central1',
          modelType: 'CUSTOMER_HOSTED',
          status: 'RUNNING',
          destinationAccountID: 'project-123',
        };

        const deletionError = new Error('Failed to delete node pool');
        mockOmnistrateClient.getDeploymentCell.mockResolvedValue(mockDeploymentCell);
        (deleteObservabilityNodePool as jest.Mock).mockRejectedValue(deletionError);

        // Act & Assert
        await expect(handleCellDeletion(deploymentCellId)).rejects.toThrow('Failed to delete node pool');
      });

      it('should handle errors from getBYOCCloudAccounts', async () => {
        // Arrange
        const deploymentCellId = 'byoa-error-cell';
        const mockDeploymentCell = {
          id: deploymentCellId,
          cloudProvider: 'aws' as const,
          region: 'us-west-2',
          modelType: 'BYOA',
          status: 'RUNNING',
          destinationAccountID: 'account-123',
        };

        mockOmnistrateClient.getDeploymentCell.mockResolvedValue(mockDeploymentCell);
        mockOmnistrateClient.getBYOCCloudAccounts.mockRejectedValue(new Error('API error'));

        // Act & Assert
        await expect(handleCellDeletion(deploymentCellId)).rejects.toThrow('API error');
        expect(deleteObservabilityNodePool).not.toHaveBeenCalled();
      });

      it('should handle errors from getDeploymentCellCredentials', async () => {
        // Arrange
        const deploymentCellId = 'cred-error-cell';
        const mockDeploymentCell = {
          id: deploymentCellId,
          cloudProvider: 'gcp' as const,
          region: 'asia-east1',
          modelType: 'BYOA',
          status: 'RUNNING',
          destinationAccountID: 'project-456',
        };

        mockOmnistrateClient.getDeploymentCell.mockResolvedValue(mockDeploymentCell);
        mockOmnistrateClient.getBYOCCloudAccounts.mockResolvedValue([]);
        mockOmnistrateClient.getDeploymentCellCredentials.mockRejectedValue(
          new Error('Credentials not available')
        );

        // Act & Assert
        await expect(handleCellDeletion(deploymentCellId)).rejects.toThrow('Credentials not available');
        expect(deleteObservabilityNodePool).not.toHaveBeenCalled();
      });
    });

    describe('Cluster naming', () => {
      it('should format GCP cluster name correctly by removing hyphens', async () => {
        // Arrange
        const deploymentCellId = 'abc-def-ghi-jkl';
        const mockDeploymentCell = {
          id: deploymentCellId,
          cloudProvider: 'gcp' as const,
          region: 'us-central1',
          modelType: 'CUSTOMER_HOSTED',
          status: 'RUNNING',
          destinationAccountID: 'project-123',
        };

        mockOmnistrateClient.getDeploymentCell.mockResolvedValue(mockDeploymentCell);
        (deleteObservabilityNodePool as jest.Mock).mockResolvedValue(undefined);

        // Act
        await handleCellDeletion(deploymentCellId);

        // Assert
        expect(deleteObservabilityNodePool).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'c-abcdefghijkl',
          })
        );
      });

      it('should not modify cluster name for GCP clusters already starting with c-', async () => {
        // Arrange
        const deploymentCellId = 'c-alreadyformatted';
        const mockDeploymentCell = {
          id: deploymentCellId,
          cloudProvider: 'gcp' as const,
          region: 'us-central1',
          modelType: 'CUSTOMER_HOSTED',
          status: 'RUNNING',
          destinationAccountID: 'project-123',
        };

        mockOmnistrateClient.getDeploymentCell.mockResolvedValue(mockDeploymentCell);
        (deleteObservabilityNodePool as jest.Mock).mockResolvedValue(undefined);

        // Act
        await handleCellDeletion(deploymentCellId);

        // Assert
        expect(deleteObservabilityNodePool).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'c-alreadyformatted',
          })
        );
      });

      it('should keep AWS cluster name unchanged', async () => {
        // Arrange
        const deploymentCellId = 'aws-cluster-with-hyphens';
        const mockDeploymentCell = {
          id: deploymentCellId,
          cloudProvider: 'aws' as const,
          region: 'us-east-1',
          modelType: 'CUSTOMER_HOSTED',
          status: 'RUNNING',
          destinationAccountID: 'account-123',
        };

        mockOmnistrateClient.getDeploymentCell.mockResolvedValue(mockDeploymentCell);
        (deleteObservabilityNodePool as jest.Mock).mockResolvedValue(undefined);

        // Act
        await handleCellDeletion(deploymentCellId);

        // Assert
        expect(deleteObservabilityNodePool).toHaveBeenCalledWith(
          expect.objectContaining({
            name: deploymentCellId,
          })
        );
      });
    });
  });
});
