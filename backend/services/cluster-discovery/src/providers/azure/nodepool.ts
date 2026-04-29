import { Cluster } from '../../types';
import logger from '../../logger';
import { createContainerServiceClient, getResourceGroupForCluster } from './client';
import { AZURE } from '../../constants';

const OBSERVABILITY_POOL_NAME = AZURE.OBSERVABILITY_POOL_NAME;
const SECURITY_POOL_NAME = AZURE.SECURITY_POOL_NAME;

export async function createObservabilityNodePool(cluster: Cluster): Promise<void> {
  try {
    const client = createContainerServiceClient();

    const resourceGroup =
      (cluster.labels as Record<string, string>)?.['azure-resource-group'] ?? (await getResourceGroupForCluster(cluster.name));

    // Check if the agent pool already exists
    let existingPool = null;
    try {
      existingPool = await client.agentPools.get(resourceGroup, cluster.name, OBSERVABILITY_POOL_NAME);
    } catch (error: any) {
      if (error.statusCode !== 404 && error.code !== 'ResourceNotFound' && error.code !== 'AgentPoolNotFound') {
        throw error;
      }
      // 404 / ResourceNotFound means the pool does not exist – proceed to create it
    }

    if (existingPool) {
      // Check if update is needed
      const needsScalingUpdate =
        existingPool.minCount !== AZURE.DEFAULT_MIN_NODES ||
        existingPool.maxCount !== AZURE.DEFAULT_MAX_NODES;

      if (existingPool.vmSize !== AZURE.DEFAULT_MACHINE_TYPE) {
        logger.warn(
          { cluster: cluster.name, current: existingPool.vmSize, desired: AZURE.DEFAULT_MACHINE_TYPE },
          'Observability node pool VM size mismatch - requires pool recreation to change',
        );
      }

      if (needsScalingUpdate) {
        await client.agentPools.beginCreateOrUpdateAndWait(resourceGroup, cluster.name, OBSERVABILITY_POOL_NAME, {
          ...existingPool,
          enableAutoScaling: true,
          minCount: AZURE.DEFAULT_MIN_NODES,
          maxCount: AZURE.DEFAULT_MAX_NODES,
          nodeLabels: { node_pool: 'observability' },
        });
        logger.info({ cluster: cluster.name }, 'Observability node pool updated.');
      } else {
        logger.info({ cluster: cluster.name }, 'Observability node pool already up to date.');
      }
      return;
    }

    await client.agentPools.beginCreateOrUpdateAndWait(resourceGroup, cluster.name, OBSERVABILITY_POOL_NAME, {
      count: 1,
      vmSize: AZURE.DEFAULT_MACHINE_TYPE,
      osDiskSizeGB: AZURE.DEFAULT_DISK_SIZE_GB,
      enableAutoScaling: true,
      minCount: AZURE.DEFAULT_MIN_NODES,
      maxCount: AZURE.DEFAULT_MAX_NODES,
      mode: 'User',
      nodeLabels: { node_pool: "observability" },
      type: 'VirtualMachineScaleSets',
    });

    logger.info({ cluster: cluster.name }, 'Observability node pool created.');
  } catch (error: any) {
    logger.error(
      { cluster: cluster.name, error, errorName: error?.name, errorMessage: error?.message },
      'Failed to ensure observability node pool',
    );
  }
}

export async function createSecurityNodePool(cluster: Cluster): Promise<void> {
  try {
    const client = createContainerServiceClient();

    const resourceGroup =
      (cluster.labels as Record<string, string>)?.['azure-resource-group'] ?? (await getResourceGroupForCluster(cluster.name));

    let existingPool = null;
    try {
      existingPool = await client.agentPools.get(resourceGroup, cluster.name, SECURITY_POOL_NAME);
    } catch (error: any) {
      if (error.statusCode !== 404 && error.code !== 'ResourceNotFound' && error.code !== 'AgentPoolNotFound') {
        throw error;
      }
    }

    if (existingPool) {
      const needsScalingUpdate =
        existingPool.minCount !== AZURE.SECURITY_MIN_NODES ||
        existingPool.maxCount !== AZURE.SECURITY_MAX_NODES;

      if (existingPool.vmSize !== AZURE.SECURITY_MACHINE_TYPE) {
        logger.warn(
          { cluster: cluster.name, current: existingPool.vmSize, desired: AZURE.SECURITY_MACHINE_TYPE },
          'Security node pool VM size mismatch - requires pool recreation to change',
        );
      }

      if (needsScalingUpdate) {
        await client.agentPools.beginCreateOrUpdateAndWait(resourceGroup, cluster.name, SECURITY_POOL_NAME, {
          ...existingPool,
          enableAutoScaling: true,
          minCount: AZURE.SECURITY_MIN_NODES,
          maxCount: AZURE.SECURITY_MAX_NODES,
          nodeLabels: { node_pool: 'security' },
        });
        logger.info({ cluster: cluster.name }, 'Security node pool updated.');
      } else {
        logger.info({ cluster: cluster.name }, 'Security node pool already up to date.');
      }
      return;
    }

    await client.agentPools.beginCreateOrUpdateAndWait(resourceGroup, cluster.name, SECURITY_POOL_NAME, {
      count: 0,
      vmSize: AZURE.SECURITY_MACHINE_TYPE,
      osDiskSizeGB: AZURE.DEFAULT_DISK_SIZE_GB,
      enableAutoScaling: true,
      minCount: AZURE.SECURITY_MIN_NODES,
      maxCount: AZURE.SECURITY_MAX_NODES,
      mode: 'User',
      nodeLabels: { node_pool: 'security' },
      type: 'VirtualMachineScaleSets',
    });

    logger.info({ cluster: cluster.name }, 'Security node pool created.');
  } catch (error: any) {
    logger.error(
      { cluster: cluster.name, error, errorName: error?.name, errorMessage: error?.message },
      'Failed to ensure security node pool',
    );
  }
}
