import { Cluster } from '../types';
import { createObservabilityNodePool as createObservabilityNodePoolGCP } from './gcp/nodepool';
import { createObservabilityNodePool as createObservabilityNodePoolAWS } from './aws/nodepool';
import { deleteObservabilityNodePool as deleteObservabilityNodePoolGCP } from './gcp/nodepool-delete';
import { deleteObservabilityNodePool as deleteObservabilityNodePoolAWS } from './aws/nodepool-delete';
import logger from '../logger';
import { createObservabilityNodePoolAWSBYOA, createObservabilityNodePoolGCPBYOA } from './byoa/nodepool';
import { deleteObservabilityNodePoolAWSBYOA, deleteObservabilityNodePoolGCPBYOA } from './byoa/nodepool-delete';

/**
 * Creates observability node pool for a cluster based on cloud provider and host mode
 * @param cluster - Target cluster
 */
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

/**
 * Deletes observability node pool for a cluster based on cloud provider and host mode
 * @param cluster - Target cluster
 */
export function deleteObservabilityNodePool(cluster: Cluster) {
  if (cluster.hostMode === 'byoa') {
    if (!cluster.destinationAccountID) {
      logger.warn(`Skip node pool deletion for BYOA cluster ${cluster.name} without destinationAccountID`);
      return;
    }
    switch (cluster.cloud) {
      case 'gcp':
        return deleteObservabilityNodePoolGCPBYOA(cluster);
      case 'aws':
        return deleteObservabilityNodePoolAWSBYOA(cluster);
      default:
        logger.warn(`Skip node pool deletion for cloud provider ${cluster.cloud} BYOA cluster`);
    }
  }

  switch (cluster.cloud) {
    case 'gcp':
      return deleteObservabilityNodePoolGCP(cluster);
    case 'aws':
      return deleteObservabilityNodePoolAWS(cluster);
    default:
      logger.warn(`Skip node pool deletion for cloud provider ${cluster.cloud}`);
  }
}

// Re-export individual provider functions if needed
export { createObservabilityNodePoolGCP, createObservabilityNodePoolAWS };
export { createObservabilityNodePoolAWSBYOA, createObservabilityNodePoolGCPBYOA };
export { deleteObservabilityNodePoolGCP, deleteObservabilityNodePoolAWS };
export { deleteObservabilityNodePoolAWSBYOA, deleteObservabilityNodePoolGCPBYOA };
