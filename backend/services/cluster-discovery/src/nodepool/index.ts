import { Cluster } from '../types';
import { createObservabilityNodePool as createObservabilityNodePoolGCP } from './gcp';
import { createObservabilityNodePool as createObservabilityNodePoolAWS } from './aws';
import logger from '../logger';
import { createObservabilityNodePoolAWSBYOA, createObservabilityNodePoolGCPBYOA } from './byoa';

export function createObservabilityNodePool(cluster: Cluster) {
  if (cluster.hostMode === 'byoa') {
    if (!cluster.destinationAccountID) {
      logger.warn(`Skip node pool creation for BYOA cluster ${cluster.name} without destinationAccountID`);
      return;
    }
    switch (cluster.cloud) {
      case 'gcp':
        return createObservabilityNodePoolGCPBYOA(cluster);
      case 'aws':
        return createObservabilityNodePoolAWSBYOA(cluster);
      default:
        logger.warn(`Skip node pool creation for cloud provider ${cluster.cloud} BYOA cluster`);
    }
  }

  switch (cluster.cloud) {
    case 'gcp':
      return createObservabilityNodePoolGCP(cluster);
    case 'aws':
      return createObservabilityNodePoolAWS(cluster);
    default:
      logger.warn(`Skip node pool creation for cloud provider ${cluster.cloud}`);
  }
}
