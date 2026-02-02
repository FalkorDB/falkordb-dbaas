import logger from '../logger';
import { Cluster } from '../types';
import { DiscoveryService } from './DiscoveryService';
import { RegistrationService, ClusterSecret } from './RegistrationService';
import { NodePoolService } from './NodePoolService';
import { SecretManagementService } from './SecretManagementService';

export interface ClusterDiscoveryConfig {
  whitelist: string[];
  blacklist: string[];
  deleteUnknownSecrets: boolean;
}

export class ClusterDiscoveryService {
  private discoveryService: DiscoveryService;
  private registrationService: RegistrationService;
  private nodePoolService: NodePoolService;
  private secretService: SecretManagementService;
  private config: ClusterDiscoveryConfig;

  constructor(config: ClusterDiscoveryConfig) {
    this.config = config;
    this.discoveryService = new DiscoveryService();
    this.registrationService = new RegistrationService();
    this.nodePoolService = new NodePoolService();
    this.secretService = new SecretManagementService();
  }

  async run(): Promise<void> {
    const startTime = Date.now();
    logger.info('Starting cluster discovery and registration process');

    try {
      // Step 1: Discover all clusters
      const { gcpClusters, awsClusters, byoaClusters, awsCredentials } =
        await this.discoveryService.discoverAllClusters();

      // Step 2: Combine and filter clusters
      const allClusters = [...gcpClusters, ...awsClusters, ...byoaClusters];
      const discoveredClusters = this.discoveryService.applyFilters(
        allClusters,
        this.config.whitelist,
        this.config.blacklist,
      );

      logger.info(
        {
          total: allClusters.length,
          filtered: discoveredClusters.length,
          clusters: discoveredClusters.map((c) => c.name),
        },
        'Clusters discovered and filtered',
      );

      // Step 3: Rotate AWS credentials if available
      await this.registrationService.rotateAWSCredentials(awsCredentials);

      // Step 4: Get existing cluster secrets
      const existingSecrets = await this.registrationService.getExistingSecrets();

      // Step 5: Register or update discovered clusters
      await this.registerClusters(discoveredClusters, existingSecrets);

      // Step 6: Deregister clusters that no longer exist
      await this.deregisterStaleSecrets(discoveredClusters, existingSecrets);

      const duration = Date.now() - startTime;
      logger.info({ durationMs: duration }, 'Cluster discovery and registration completed successfully');
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error({ error, durationMs: duration }, 'Cluster discovery and registration failed');
      throw error;
    }
  }

  private async registerClusters(clusters: Cluster[], existingSecrets: ClusterSecret[]): Promise<void> {
    for (const cluster of clusters) {
      const existingSecret = existingSecrets.find(
        (secret) => secret.labels.cluster === cluster.name || secret.name === cluster.name,
      );

      const isNewCluster = !existingSecret;

      // Create node pool for new clusters
      if (isNewCluster) {
        await this.nodePoolService.createObservabilityNodePoolIfNeeded(cluster);
      }

      // Register or update cluster
      await this.registrationService.registerOrUpdateCluster(cluster, existingSecret);

      // Create PagerDuty secret for new clusters
      if (isNewCluster) {
        await this.secretService.createPagerDutySecret(cluster);
      }

      // Always update VMUser secret
      await this.secretService.createOrUpdateVMUserSecret(cluster);
    }
  }

  private async deregisterStaleSecrets(
    discoveredClusters: Cluster[],
    existingSecrets: ClusterSecret[],
  ): Promise<void> {
    for (const secret of existingSecrets) {
      // Skip control plane secrets
      if (this.registrationService.isControlPlaneSecret(secret)) {
        continue;
      }

      // Check if cluster still exists
      const clusterExists = discoveredClusters.some((cluster) => cluster.name === secret.labels.cluster || cluster.name === secret.name);

      if (!clusterExists) {
        await this.registrationService.deregisterCluster(secret.name, this.config.deleteUnknownSecrets);
      }
    }
  }
}
