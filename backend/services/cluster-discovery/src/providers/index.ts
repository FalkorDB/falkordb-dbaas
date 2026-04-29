import { Cluster } from '../types';
import { createObservabilityNodePool as createObservabilityNodePoolGCP, createSecurityNodePool as createSecurityNodePoolGCP } from './gcp/nodepool';
import { createObservabilityNodePool as createObservabilityNodePoolAWS, createSecurityNodePool as createSecurityNodePoolAWS } from './aws/nodepool';
import { createObservabilityNodePool as createObservabilityNodePoolAzure, createSecurityNodePool as createSecurityNodePoolAzure } from './azure/nodepool';
import { deleteObservabilityNodePool as deleteObservabilityNodePoolGCP, deleteSecurityNodePool as deleteSecurityNodePoolGCP } from './gcp/nodepool-delete';
import { deleteObservabilityNodePool as deleteObservabilityNodePoolAWS, deleteSecurityNodePool as deleteSecurityNodePoolAWS } from './aws/nodepool-delete';
import { deleteObservabilityNodePool as deleteObservabilityNodePoolAzure, deleteSecurityNodePool as deleteSecurityNodePoolAzure } from './azure/nodepool-delete';
import logger from '../logger';
import { createObservabilityNodePoolAWSBYOA, createObservabilityNodePoolAzureBYOA, createObservabilityNodePoolGCPBYOA, createSecurityNodePoolAWSBYOA, createSecurityNodePoolAzureBYOA, createSecurityNodePoolGCPBYOA } from './byoa/nodepool';
import { deleteObservabilityNodePoolAWSBYOA, deleteObservabilityNodePoolAzureBYOA, deleteObservabilityNodePoolGCPBYOA, deleteSecurityNodePoolAWSBYOA, deleteSecurityNodePoolAzureBYOA, deleteSecurityNodePoolGCPBYOA } from './byoa/nodepool-delete';

/**
 * Creates observability node pool for a cluster based on cloud provider and host mode
 * @param cluster - Target cluster
 */
export function createObservabilityNodePool(cluster: Cluster) {
  if (cluster.hostMode === 'byoa') {
    switch (cluster.cloud) {
      case 'gcp':
        return createObservabilityNodePoolGCPBYOA(cluster);
      case 'aws':
        return createObservabilityNodePoolAWSBYOA(cluster);
      case 'azure':
        return createObservabilityNodePoolAzureBYOA(cluster);
      default:
        logger.warn(`Skip node pool creation for cloud provider ${cluster.cloud} BYOA cluster`);
    }
  }

  switch (cluster.cloud) {
    case 'gcp':
      return createObservabilityNodePoolGCP(cluster);
    case 'aws':
      return createObservabilityNodePoolAWS(cluster);
    case 'azure':
      return createObservabilityNodePoolAzure(cluster);
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
    switch (cluster.cloud) {
      case 'gcp':
        return deleteObservabilityNodePoolGCPBYOA(cluster);
      case 'aws':
        return deleteObservabilityNodePoolAWSBYOA(cluster);
      case 'azure':
        return deleteObservabilityNodePoolAzureBYOA(cluster);
      default:
        logger.warn(`Skip node pool deletion for cloud provider ${cluster.cloud} BYOA cluster`);
    }
  }

  switch (cluster.cloud) {
    case 'gcp':
      return deleteObservabilityNodePoolGCP(cluster);
    case 'aws':
      return deleteObservabilityNodePoolAWS(cluster);
    case 'azure':
      return deleteObservabilityNodePoolAzure(cluster);
    default:
      logger.warn(`Skip node pool deletion for cloud provider ${cluster.cloud}`);
  }
}

/**
 * Creates security node pool for a cluster based on cloud provider and host mode
 * @param cluster - Target cluster
 */
export function createSecurityNodePool(cluster: Cluster) {
  if (cluster.hostMode === 'byoa') {
    switch (cluster.cloud) {
      case 'gcp':
        return createSecurityNodePoolGCPBYOA(cluster);
      case 'aws':
        return createSecurityNodePoolAWSBYOA(cluster);
      case 'azure':
        return createSecurityNodePoolAzureBYOA(cluster);
      default:
        logger.warn(`Skip security node pool creation for cloud provider ${cluster.cloud} BYOA cluster`);
    }
  }

  switch (cluster.cloud) {
    case 'gcp':
      return createSecurityNodePoolGCP(cluster);
    case 'aws':
      return createSecurityNodePoolAWS(cluster);
    case 'azure':
      return createSecurityNodePoolAzure(cluster);
    default:
      logger.warn(`Skip security node pool creation for cloud provider ${cluster.cloud}`);
  }
}

/**
 * Deletes security node pool for a cluster based on cloud provider and host mode
 * @param cluster - Target cluster
 */
export function deleteSecurityNodePool(cluster: Cluster) {
  if (cluster.hostMode === 'byoa') {
    switch (cluster.cloud) {
      case 'gcp':
        return deleteSecurityNodePoolGCPBYOA(cluster);
      case 'aws':
        return deleteSecurityNodePoolAWSBYOA(cluster);
      case 'azure':
        return deleteSecurityNodePoolAzureBYOA(cluster);
      default:
        logger.warn(`Skip security node pool deletion for cloud provider ${cluster.cloud} BYOA cluster`);
    }
  }

  switch (cluster.cloud) {
    case 'gcp':
      return deleteSecurityNodePoolGCP(cluster);
    case 'aws':
      return deleteSecurityNodePoolAWS(cluster);
    case 'azure':
      return deleteSecurityNodePoolAzure(cluster);
    default:
      logger.warn(`Skip security node pool deletion for cloud provider ${cluster.cloud}`);
  }
}

// Re-export individual provider functions if needed
export { createObservabilityNodePoolGCP, createObservabilityNodePoolAWS, createObservabilityNodePoolAzure };
export { createObservabilityNodePoolAWSBYOA, createObservabilityNodePoolAzureBYOA, createObservabilityNodePoolGCPBYOA };
export { deleteObservabilityNodePoolGCP, deleteObservabilityNodePoolAWS, deleteObservabilityNodePoolAzure };
export { deleteObservabilityNodePoolAWSBYOA, deleteObservabilityNodePoolAzureBYOA, deleteObservabilityNodePoolGCPBYOA };
export { createSecurityNodePoolGCP, createSecurityNodePoolAWS, createSecurityNodePoolAzure };
export { createSecurityNodePoolAWSBYOA, createSecurityNodePoolAzureBYOA, createSecurityNodePoolGCPBYOA };
export { deleteSecurityNodePoolGCP, deleteSecurityNodePoolAWS, deleteSecurityNodePoolAzure };
export { deleteSecurityNodePoolAWSBYOA, deleteSecurityNodePoolAzureBYOA, deleteSecurityNodePoolGCPBYOA };
