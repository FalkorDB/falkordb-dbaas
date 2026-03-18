import { Cluster } from '../../types';
import logger from '../../logger';
import { createContainerServiceClient, getResourceGroupForCluster } from './client';

const OBSERVABILITY_POOL_NAME = 'observability';

export async function deleteObservabilityNodePool(cluster: Cluster): Promise<void> {
  try {
    const client = createContainerServiceClient();

    const resourceGroup =
      cluster.labels?.['azure-resource-group'] ?? (await getResourceGroupForCluster(cluster.name));

    // Check if the agent pool exists before attempting deletion
    try {
      await client.agentPools.get(resourceGroup, cluster.name, OBSERVABILITY_POOL_NAME);
    } catch (error: any) {
      if (error.statusCode === 404 || error.code === 'ResourceNotFound' || error.code === 'AgentPoolNotFound') {
        logger.info({ cluster: cluster.name }, 'Observability node pool does not exist, nothing to delete.');
        return;
      }
      throw error;
    }

    await client.agentPools.beginDeleteAndWait(resourceGroup, cluster.name, OBSERVABILITY_POOL_NAME);

    logger.info({ cluster: cluster.name }, 'Observability node pool deleted.');
  } catch (error: any) {
    logger.error(
      { cluster: cluster.name, error, errorName: error?.name, errorMessage: error?.message },
      'Failed to delete observability node pool',
    );
    throw error;
  }
}
