import { ClusterManagerClient } from '@google-cloud/container';
import { ClusterSchema, Cluster } from '../types';
import logger from '../logger';

const client = new ClusterManagerClient();

export async function discoverGCPClusters(): Promise<{ clusters: Cluster[] }> {
  logger.info('Discovering GCP clusters...');

  const [response] = await client.listClusters({
    parent: `projects/${process.env.APPLICATION_PLANE_GOOGLE_CLOUD_PROJECT}/locations/-`,
  });

  const clusters = await Promise.all(
    response.clusters?.map(async (cluster) => {
      // Check if critical properties exist before proceeding
      if (!cluster.name || !cluster.endpoint || !cluster.masterAuth?.clusterCaCertificate) {
        logger.warn(`Skipping cluster due to missing properties: ${cluster.name || 'Unknown'}`);
        return null; // Return null for invalid clusters
      }

      logger.debug(`Discovered GCP cluster: ${cluster.name}`);
      return {
        name: cluster.name,
        endpoint: `https://${cluster.endpoint}`,
        labels: cluster.resourceLabels,
        cloud: 'gcp',
        region: cluster.location,
        secretConfig: {
          execProviderConfig: {
            command: 'argocd-k8s-auth',
            args: ['gcp'],
            apiVersion: 'client.authentication.k8s.io/v1beta1',
          },
          tlsClientConfig: {
            insecure: false,
            caData: cluster.masterAuth?.clusterCaCertificate,
          },
        },
        hostMode: 'managed',
      } as Cluster;
    }) || [],
  );

  const validClusters = clusters.filter((c): c is Cluster => c !== null);

  logger.info({ clusterCount: validClusters.length }, `Found ${validClusters.length} GCP clusters.`);

  // Validate clusters
  return { clusters: validClusters.map((cluster) => ClusterSchema.validateSync(cluster)) };
}
