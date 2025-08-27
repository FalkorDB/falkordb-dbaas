import { ClusterManagerClient } from '@google-cloud/container';
import { Cluster } from '../types';
import logger from '../logger';

const client = new ClusterManagerClient();


export async function createObservabilityNodePool(cluster: Cluster): Promise<void> {

  try {
    const [nodePools] = await client.listNodePools({
      parent: `projects/${process.env.APPLICATION_PLANE_GOOGLE_CLOUD_PROJECT}/locations/${cluster.region}/clusters/${cluster.name}`,
    });

    const exists = nodePools.nodePools?.some(
      (np) => np.name === 'observability'
    );

    if (exists) {
      logger.info({ cluster: cluster.name }, 'Observability node pool already exists.');
      return;
    }

    await client.createNodePool({
      parent: `projects/${process.env.APPLICATION_PLANE_GOOGLE_CLOUD_PROJECT}/locations/${cluster.region}/clusters/${cluster.name}`,
      nodePool: {
        name: 'observability',
        initialNodeCount: 1,
        config: {
          machineType: 'e2-standard-2',
          diskSizeGb: 50,
          labels: { node_pool: 'observability' },
        },
        autoscaling: {
          enabled: true,
          maxNodeCount: 10,
          minNodeCount: 1,
        },
        maxPodsConstraint: {
          maxPodsPerNode: 25
        }
      },
    });

    logger.info({ cluster: cluster.name }, 'Observability node pool created.');
  } catch (error) {
    logger.error({ cluster: cluster.name, error }, 'Failed to create observability node pool:',);
  }
}