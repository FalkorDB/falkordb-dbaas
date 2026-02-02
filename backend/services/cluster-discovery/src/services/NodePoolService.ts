import { createObservabilityNodePool } from '../providers';
import logger from '../logger';
import { Cluster } from '../types';

export class NodePoolService {
  async createObservabilityNodePoolIfNeeded(cluster: Cluster): Promise<void> {
    try {
      await createObservabilityNodePool(cluster);
      logger.info({ cluster: cluster.name }, 'Observability node pool creation initiated');
    } catch (error) {
      logger.error({ error, cluster: cluster.name }, 'Failed to create observability node pool');
      // Don't throw - node pool creation is non-critical for registration
    }
  }
}
