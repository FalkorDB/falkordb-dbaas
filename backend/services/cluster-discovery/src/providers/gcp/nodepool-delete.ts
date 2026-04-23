import { ClusterManagerClient } from '@google-cloud/container';
import { Cluster } from '../../types';
import logger from '../../logger';

const client = new ClusterManagerClient();

export async function deleteObservabilityNodePool(cluster: Cluster): Promise<void> {
  let exists = false;
  try {
    const [nodePools] = await client.listNodePools({
      parent: `projects/${process.env.APPLICATION_PLANE_GOOGLE_CLOUD_PROJECT}/locations/${cluster.region}/clusters/${cluster.name}`,
    });
    exists = nodePools.nodePools?.some((np) => np.name === 'observability');
  } catch (error) {
    if (error.code === 5) {
      logger.warn({ cluster: cluster.name }, 'Observability node pool not found, already deleted.');
      return;
    }
    logger.error({ cluster: cluster.name, error }, 'Failed to list observability node pools');
    throw error;
  }

  if (!exists) {
    logger.info({ cluster: cluster.name }, 'Observability node pool does not exist, nothing to delete.');
    return;
  }
  try {
    await client.deleteNodePool({
      name: `projects/${process.env.APPLICATION_PLANE_GOOGLE_CLOUD_PROJECT}/locations/${cluster.region}/clusters/${cluster.name}/nodePools/observability`,
    });

    logger.info({ cluster: cluster.name }, 'Observability node pool deleted.');
  } catch (error: any) {
    logger.error({ cluster: cluster.name, error }, 'Failed to delete observability node pool');
    throw error;
  }
}

export async function deleteSecurityNodePool(cluster: Cluster): Promise<void> {
  const parent = `projects/${process.env.APPLICATION_PLANE_GOOGLE_CLOUD_PROJECT}/locations/${cluster.region}/clusters/${cluster.name}`;
  let exists = false;
  try {
    const [nodePools] = await client.listNodePools({ parent });
    exists = nodePools.nodePools?.some((np) => np.name === 'security');
  } catch (error) {
    if (error.code === 5) {
      logger.warn({ cluster: cluster.name }, 'Security node pool not found, already deleted.');
      return;
    }
    logger.error({ cluster: cluster.name, error }, 'Failed to list security node pools');
    throw error;
  }

  if (!exists) {
    logger.info({ cluster: cluster.name }, 'Security node pool does not exist, nothing to delete.');
    return;
  }

  try {
    await client.deleteNodePool({
      name: `${parent}/nodePools/security`,
    });

    logger.info({ cluster: cluster.name }, 'Security node pool deleted.');
  } catch (error: any) {
    logger.error({ cluster: cluster.name, error }, 'Failed to delete security node pool');
    throw error;
  }
}
