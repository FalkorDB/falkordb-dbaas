import { Cluster } from "../types";
import { createObservabilityNodePool as createObservabilityNodePoolGCP } from './gcp'
import { createObservabilityNodePool as createObservabilityNodePoolAWS } from './aws'
import logger from "../logger";

export function createObservabilityNodePool(cluster: Cluster) {
  switch (cluster.cloud) {
    case 'gcp':
      return createObservabilityNodePoolGCP(cluster);
    case 'aws':
      return createObservabilityNodePoolAWS(cluster);
    default:
      logger.warn(`Skip node pool creation for cloud provider ${cluster.cloud}`)
  }
}