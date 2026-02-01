/**
 * Mock for @google-cloud/container ClusterManagerClient
 */
export class ClusterManagerClient {
  listClusters = jest.fn();
  listNodePools = jest.fn();
  createNodePool = jest.fn();
  getCluster = jest.fn();
}
