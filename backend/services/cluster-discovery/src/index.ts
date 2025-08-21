import { discoverGCPClusters } from './discovery/gcp';
import { discoverAWSClusters } from './discovery/aws';
import logger from './logger';
import { createClusterSecret, deleteClusterSecret, listClusterSecrets, makeClusterLabels, updateClusterSecret, rotateAWSSecret } from './registration/argocd';
import { isEqual } from 'lodash'

// Parse environment variables as comma-separated lists
const WHITELIST_CLUSTERS = process.env.WHITELIST_CLUSTERS?.split(',').map((name) => name.trim()) || [];
const BLACKLIST_CLUSTERS = process.env.BLACKLIST_CLUSTERS?.split(',').map((name) => name.trim()) || [];

// Main function to discover, register, and deregister clusters
async function main() {
  logger.info('Starting cluster discovery...');

  // Discover clusters
  const { clusters: gcpClusters } = await discoverGCPClusters().catch((err) => {
    logger.error(err, 'Error discovering GCP clusters:');
    return { clusters: [] };
  });
  const { clusters: awsClusters, credentials: awsCredentials } = await discoverAWSClusters().catch((err) => {
    logger.error(err, 'Error discovering AWS clusters:');
    return { clusters: [], credentials: undefined, };
  });
  // const azureClusters = await discoverAzureClusters().catch((err) => {
  //   logger.error(err, 'Error discovering Azure clusters:');
  //   return [];
  // });

  // Combine all discovered clusters
  let discoveredClusters = [...gcpClusters, ...awsClusters,] // ...azureClusters];

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

  await rotateAWSSecret(awsCredentials);

  // Get existing secrets in the Kubernetes cluster
  const existingSecrets = await listClusterSecrets();

  // Add or update secrets for discovered clusters
  for (const cluster of discoveredClusters) {
    const existingSecret = existingSecrets.find((secret) => secret.labels.cluster === cluster.name || secret.name === cluster.name);
    if (existingSecret) {
      if (!isEqual(makeClusterLabels(cluster), existingSecret.labels)) {
        await updateClusterSecret(existingSecret.name, cluster);
      }
    } else {
      await createClusterSecret(cluster);
    }
  }

  // Remove secrets for clusters that are no longer discovered
  for (const secret of existingSecrets) {
    if (!discoveredClusters.some((cluster) => cluster.name === secret.labels.cluster)) {
      if (process.env.DELETE_UNKNOWN_SECRETS === "true") {
        await deleteClusterSecret(secret.name);
      } else {
        logger.info(`Skipping deletion of secret ${secret.name}. Env variable DELETE_UNKNOWN_SECRETS is not set to "true".`);
      }
    }
  }

  logger.info('Cluster discovery and registration completed.');
}

main().catch((err) => {
  logger.error('Error during cluster discovery:', err);
  process.exit(1);
});
