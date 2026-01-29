/**
 * Mock for @google-cloud/container ClusterManagerClient
 */
export class ClusterManagerClient {
  listClusters = jest.fn();
  listNodePools = jest.fn();
  createNodePool = jest.fn();
  getCluster = jest.fn();
}

/**
 * Mock for google-auth-library
 */
export class OAuth2Client {
  setCredentials = jest.fn();
  getAccessToken = jest.fn();
}

export class Impersonated {
  constructor(config: any) {}
  getAccessToken = jest.fn();
}

export class GoogleAuth {
  getClient = jest.fn();
}
