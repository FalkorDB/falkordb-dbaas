import { Cluster } from '../../types';
import logger from '../../logger';
import { createContainerServiceClient, getResourceGroupForCluster } from './client';

const OBSERVABILITY_POOL_NAME = 'obsrv';
const SECURITY_POOL_NAME = 'security';

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
      vmSize: 'Standard_B2ms',
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

export async function createSecurityNodePool(cluster: Cluster): Promise<void> {
  try {
    const client = createContainerServiceClient();

    const resourceGroup =
      cluster.labels?.['azure-resource-group'] ?? (await getResourceGroupForCluster(cluster.name));

    try {
      await client.agentPools.get(resourceGroup, cluster.name, SECURITY_POOL_NAME);
      logger.info({ cluster: cluster.name }, 'Security node pool already exists.');
      return;
    } catch (error: any) {
      if (error.statusCode !== 404 && error.code !== 'ResourceNotFound' && error.code !== 'AgentPoolNotFound') {
        throw error;
      }
    }

    await client.agentPools.beginCreateOrUpdateAndWait(resourceGroup, cluster.name, SECURITY_POOL_NAME, {
      count: 0,
      vmSize: 'Standard_D4s_v3',
      osDiskSizeGB: 50,
      enableAutoScaling: true,
      minCount: 0,
      maxCount: 3,
      mode: 'User',
      nodeLabels: { node_pool: 'security' },
      type: 'VirtualMachineScaleSets',
    });

    logger.info({ cluster: cluster.name }, 'Security node pool created.');
  } catch (error: any) {
    logger.error(
      { cluster: cluster.name, error, errorName: error?.name, errorMessage: error?.message },
      'Failed to create security node pool',
    );
  }
}
