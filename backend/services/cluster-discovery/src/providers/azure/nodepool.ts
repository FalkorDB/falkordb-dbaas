import { Cluster } from '../../types';
import logger from '../../logger';
import { createContainerServiceClient, getResourceGroupForCluster } from './client';

const OBSERVABILITY_POOL_NAME = 'observpool';

export async function createObservabilityNodePool(cluster: Cluster): Promise<void> {
  try {
    const client = createContainerServiceClient();

    const resourceGroup =
      cluster.labels?.['azure-resource-group'] ?? (await getResourceGroupForCluster(cluster.name));

    // Check if the agent pool already exists
    try {
      await client.agentPools.get(resourceGroup, cluster.name, OBSERVABILITY_POOL_NAME);
      logger.info({ cluster: cluster.name }, 'Observability node pool already exists.');
      return;
    } catch (error: any) {
      if (error.statusCode !== 404 && error.code !== 'ResourceNotFound' && error.code !== 'AgentPoolNotFound') {
        throw error;
      }
      // 404 / ResourceNotFound means the pool does not exist – proceed to create it
    }

    await client.agentPools.beginCreateOrUpdateAndWait(resourceGroup, cluster.name, OBSERVABILITY_POOL_NAME, {
      count: 1,
      vmSize: 'Standard_D2s_v3',
      osDiskSizeGB: 50,
      enableAutoScaling: true,
      minCount: 1,
      maxCount: 10,
      mode: 'User',
      nodeLabels: { node_pool: "observability" },
      type: 'VirtualMachineScaleSets',
    });

    logger.info({ cluster: cluster.name }, 'Observability node pool created.');
  } catch (error: any) {
    logger.error(
      { cluster: cluster.name, error, errorName: error?.name, errorMessage: error?.message },
      'Failed to create observability node pool',
    );
  }
}
