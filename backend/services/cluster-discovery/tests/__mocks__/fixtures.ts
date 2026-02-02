import { Cluster } from '../../src/types';

/**
 * Test fixtures for cluster objects
 */

export const mockGCPCluster: Cluster = {
  name: 'test-gcp-cluster',
  endpoint: 'https://gcp-cluster-endpoint.com',
  cloud: 'gcp',
  region: 'us-central1',
  hostMode: 'managed',
  secretConfig: {
    server: 'https://gcp-cluster-endpoint.com',
    'certificate-authority-data': 'mock-ca-data',
    token: 'mock-token',
  },
  organizationId: 'org-123',
};

export const mockAWSCluster: Cluster = {
  name: 'test-aws-cluster',
  endpoint: 'https://aws-cluster-endpoint.com',
  cloud: 'aws',
  region: 'us-east-1',
  hostMode: 'managed',
  secretConfig: {
    server: 'https://aws-cluster-endpoint.com',
    'certificate-authority-data': 'mock-ca-data',
    token: 'mock-token',
  },
  organizationId: 'org-123',
};

export const mockBYOACluster: Cluster = {
  name: 'test-byoa-cluster',
  endpoint: 'https://byoa-cluster-endpoint.com',
  cloud: 'gcp',
  region: 'us-west1',
  hostMode: 'byoa',
  destinationAccountID: 'customer-project-123',
  destinationAccountNumber: '123456789012',
  secretConfig: {
    server: 'https://byoa-cluster-endpoint.com',
    'certificate-authority-data': 'mock-ca-data',
    token: 'mock-token',
    'client-certificate-data': 'mock-client-cert',
    'client-key-data': 'mock-client-key',
  },
  organizationId: 'org-789',
};

export const mockAzureCluster: Cluster = {
  name: 'test-azure-cluster',
  endpoint: 'https://azure-cluster-endpoint.com',
  cloud: 'azure',
  region: 'eastus',
  hostMode: 'managed',
  secretConfig: {
    server: 'https://azure-cluster-endpoint.com',
    'certificate-authority-data': 'mock-ca-data',
    token: 'mock-token',
  },
  organizationId: 'org-123',
};

export const mockBastionCluster: Cluster = {
  name: 'bastion-cluster',
  endpoint: 'https://bastion-endpoint.com',
  cloud: 'aws',
  region: 'us-east-2',
  hostMode: 'managed',
  secretConfig: {
    server: 'https://bastion-endpoint.com',
    'certificate-authority-data': 'mock-ca-data',
    token: 'mock-token',
  },
  organizationId: 'org-bastion',
};
