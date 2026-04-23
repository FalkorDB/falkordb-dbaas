import { ClusterManagerClient } from '@google-cloud/container';
import { Cluster } from '../../types';
import logger from '../../logger';
import { GCP } from '../../constants';

const client = new ClusterManagerClient();


export async function createObservabilityNodePool(cluster: Cluster): Promise<void> {

  try {
    const parent = `projects/${process.env.APPLICATION_PLANE_GOOGLE_CLOUD_PROJECT}/locations/${cluster.region}/clusters/${cluster.name}`;
    const [nodePools] = await client.listNodePools({ parent });

    const existingPool = nodePools.nodePools?.find(
      (np) => np.name === 'observability'
    );

    if (existingPool) {
      const poolName = `${parent}/nodePools/observability`;
      let updated = false;

      // Update machine type if it doesn't match desired spec (triggers rolling node replacement)
      if (existingPool.config?.machineType !== GCP.DEFAULT_MACHINE_TYPE) {
        logger.info(
          { cluster: cluster.name, current: existingPool.config?.machineType, desired: GCP.DEFAULT_MACHINE_TYPE },
          'Updating observability node pool machine type',
        );
        await client.updateNodePool({ name: poolName, machineType: GCP.DEFAULT_MACHINE_TYPE });
        updated = true;
      }

      // Update autoscaling if different
      if (
        !existingPool.autoscaling?.enabled ||
        existingPool.autoscaling?.maxNodeCount !== GCP.DEFAULT_MAX_NODES ||
        existingPool.autoscaling?.minNodeCount !== GCP.DEFAULT_MIN_NODES
      ) {
        await client.setNodePoolAutoscaling({
          name: poolName,
          autoscaling: { enabled: true, maxNodeCount: GCP.DEFAULT_MAX_NODES, minNodeCount: GCP.DEFAULT_MIN_NODES },
        });
        updated = true;
      }

      if (updated) {
        logger.info({ cluster: cluster.name }, 'Observability node pool updated.');
      } else {
        logger.info({ cluster: cluster.name }, 'Observability node pool already up to date.');
      }
      return;
    }

    await client.createNodePool({
      parent,
      nodePool: {
        name: 'observability',
        initialNodeCount: 1,
        config: {
          machineType: GCP.DEFAULT_MACHINE_TYPE,
          diskSizeGb: GCP.DEFAULT_DISK_SIZE_GB,
          labels: { node_pool: 'observability' },
        },
        autoscaling: {
          enabled: true,
          maxNodeCount: GCP.DEFAULT_MAX_NODES,
          minNodeCount: GCP.DEFAULT_MIN_NODES,
        },
        maxPodsConstraint: {
          maxPodsPerNode: GCP.DEFAULT_MAX_PODS_PER_NODE
        }
      },
    });

    logger.info({ cluster: cluster.name }, 'Observability node pool created.');
  } catch (error) {
    logger.error({ cluster: cluster.name, error }, 'Failed to ensure observability node pool');
  }
}

export async function createSecurityNodePool(cluster: Cluster): Promise<void> {
  try {
    const parent = `projects/${process.env.APPLICATION_PLANE_GOOGLE_CLOUD_PROJECT}/locations/${cluster.region}/clusters/${cluster.name}`;

    const [nodePools] = await client.listNodePools({ parent });

    const existingPool = nodePools.nodePools?.find((np) => np.name === 'security');

    if (existingPool) {
      const poolName = `${parent}/nodePools/security`;
      let updated = false;

      if (existingPool.config?.machineType !== GCP.SECURITY_MACHINE_TYPE) {
        logger.info(
          { cluster: cluster.name, current: existingPool.config?.machineType, desired: GCP.SECURITY_MACHINE_TYPE },
          'Updating security node pool machine type',
        );
        await client.updateNodePool({ name: poolName, machineType: GCP.SECURITY_MACHINE_TYPE });
        updated = true;
      }

      if (
        !existingPool.autoscaling?.enabled ||
        existingPool.autoscaling?.maxNodeCount !== GCP.SECURITY_MAX_NODES ||
        existingPool.autoscaling?.minNodeCount !== GCP.SECURITY_MIN_NODES
      ) {
        await client.setNodePoolAutoscaling({
          name: poolName,
          autoscaling: { enabled: true, maxNodeCount: GCP.SECURITY_MAX_NODES, minNodeCount: GCP.SECURITY_MIN_NODES },
        });
        updated = true;
      }

      if (updated) {
        logger.info({ cluster: cluster.name }, 'Security node pool updated.');
      } else {
        logger.info({ cluster: cluster.name }, 'Security node pool already up to date.');
      }
      return;
    }

    await client.createNodePool({
      parent,
      nodePool: {
        name: 'security',
        initialNodeCount: 0,
        config: {
          machineType: GCP.SECURITY_MACHINE_TYPE,
          diskSizeGb: GCP.DEFAULT_DISK_SIZE_GB,
          labels: { node_pool: 'security' },
        },
        autoscaling: {
          enabled: true,
          maxNodeCount: GCP.SECURITY_MAX_NODES,
          minNodeCount: GCP.SECURITY_MIN_NODES,
        },
        maxPodsConstraint: {
          maxPodsPerNode: GCP.DEFAULT_MAX_PODS_PER_NODE,
        },
      },
    });

    logger.info({ cluster: cluster.name }, 'Security node pool created.');
  } catch (error) {
    logger.error({ cluster: cluster.name, error }, 'Failed to ensure security node pool');
  }
}