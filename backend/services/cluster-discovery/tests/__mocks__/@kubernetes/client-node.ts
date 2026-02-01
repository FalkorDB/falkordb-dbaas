/**
 * Mock for @kubernetes/client-node
 */
export class KubeConfig {
  loadFromDefault = jest.fn();
  loadFromString = jest.fn();
  makeApiClient = jest.fn();
  applyToRequest = jest.fn();
  getCurrentCluster = jest.fn();
  setCurrentContext = jest.fn();
  exportConfig = jest.fn();
}

export class CoreV1Api {
  listNamespacedPod = jest.fn();
  readNamespacedSecret = jest.fn();
  createNamespacedSecret = jest.fn();
  deleteNamespacedSecret = jest.fn();
  replaceNamespacedSecret = jest.fn();
}

export class BatchV1Api {
  createNamespacedJob = jest.fn();
  deleteNamespacedJob = jest.fn();
  readNamespacedJob = jest.fn();
}

export class Exec {
  exec = jest.fn();
}
