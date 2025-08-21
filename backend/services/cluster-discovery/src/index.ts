import { discoverGCPClusters } from './discovery/gcp';
import { CLUSTER_SECRET_NAME_PREFIX } from './constants';
import logger from './logger';
import { createClusterSecret, deleteClusterSecret, listClusterSecrets, makeClusterLabels, updateClusterSecret } from './registration/argocd';
import { isEqual } from 'lodash'

// Parse environment variables as comma-separated lists
const WHITELIST_CLUSTERS = process.env.WHITELIST_CLUSTERS?.split(',').map((name) => name.trim()) || [];
const BLACKLIST_CLUSTERS = process.env.BLACKLIST_CLUSTERS?.split(',').map((name) => name.trim()) || [];

// Main function to discover, register, and deregister clusters
async function main() {
  logger.info('Starting cluster discovery...');

  // Discover clusters
  const gcpClusters = await discoverGCPClusters().catch((err) => {
    logger.error(err, 'Error discovering GCP clusters:');
    return [];
  });
  // const awsClusters = await discoverAWSClusters().catch((err) => {
  //   logger.error(err, 'Error discovering AWS clusters:');
  //   return [];
  // });
  // const azureClusters = await discoverAzureClusters().catch((err) => {
  //   logger.error(err, 'Error discovering Azure clusters:');
  //   return [];
  // });

  // Combine all discovered clusters
  let discoveredClusters = [...gcpClusters,] //...awsClusters, ...azureClusters];

  // Apply whitelist and blacklist filters
  if (WHITELIST_CLUSTERS.length > 0) {
    discoveredClusters = discoveredClusters.filter((cluster) =>
      WHITELIST_CLUSTERS.includes(cluster.name)
    );
  }
  if (BLACKLIST_CLUSTERS.length > 0) {
    discoveredClusters = discoveredClusters.filter(
      (cluster) => {
        if (BLACKLIST_CLUSTERS.includes(cluster.name)) {
          logger.info(`Cluster ${cluster.name} is blacklisted.`);
          return false;
        }
        return true;
      }
    );
  }

  // Get existing secrets in the Kubernetes cluster
  const existingSecrets = await listClusterSecrets();

  // Add or update secrets for discovered clusters
  for (const cluster of discoveredClusters) {
    const existingSecret = existingSecrets.find((secret) => secret.name === `${CLUSTER_SECRET_NAME_PREFIX}${cluster.name}`);
    if (existingSecret) {
      if (!isEqual(makeClusterLabels(cluster), existingSecret.labels)) {
        await updateClusterSecret(cluster);
      }
    } else {
      await createClusterSecret(cluster);
    }
  }

  // Remove secrets for clusters that are no longer discovered
  for (const secretName of existingSecrets) {
    const clusterName = secretName.name.replace(CLUSTER_SECRET_NAME_PREFIX, '');
    if (!discoveredClusters.some((cluster) => cluster.name === clusterName)) {
      await deleteClusterSecret(clusterName);
    }
  }

  logger.info('Cluster discovery and registration completed.');
}

main().catch((err) => {
  logger.error('Error during cluster discovery:', err);
  process.exit(1);
});
