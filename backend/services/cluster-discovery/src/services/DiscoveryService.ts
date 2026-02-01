import { discoverGCPClusters } from '../providers/gcp/discovery';
import { discoverAWSClusters } from '../providers/aws/discovery';
import { discoverBYOAClusters } from '../providers/omnistrate/client';
import logger from '../logger';
import { Cluster } from '../types';

export interface DiscoveryResult {
  gcpClusters: Cluster[];
  awsClusters: Cluster[];
  byoaClusters: Cluster[];
  awsCredentials?: any;
}

export class DiscoveryService {
  async discoverAllClusters(): Promise<DiscoveryResult> {
    logger.info('Starting cluster discovery across all providers...');

    const [gcpResult, awsResult, byoaResult] = await Promise.allSettled([
      discoverGCPClusters(),
      discoverAWSClusters(),
      discoverBYOAClusters(),
    ]);

    const gcpClusters =
      gcpResult.status === 'fulfilled' ? gcpResult.value.clusters : this.handleError('GCP', gcpResult.reason);
    const { clusters: awsClusters, credentials: awsCredentials } =
      awsResult.status === 'fulfilled'
        ? awsResult.value
        : { clusters: this.handleError('AWS', awsResult.reason), credentials: undefined };
    const byoaClusters =
      byoaResult.status === 'fulfilled' ? byoaResult.value.clusters : this.handleError('BYOA', byoaResult.reason);

    return {
      gcpClusters,
      awsClusters,
      byoaClusters,
      awsCredentials,
    };
  }

  private handleError(provider: string, error: any): Cluster[] {
    logger.error({ error, provider }, `Error discovering ${provider} clusters`);
    return [];
  }

  applyFilters(clusters: Cluster[], whitelist: string[], blacklist: string[]): Cluster[] {
    let filtered = clusters;

    if (whitelist.length > 0) {
      filtered = filtered.filter((cluster) => {
        const includes = whitelist.includes(cluster.name.trim().toLowerCase());
        if (!includes) {
          logger.info({ cluster: cluster.name }, 'Cluster not whitelisted');
        }
        return includes;
      });
    }

    if (blacklist.length > 0) {
      filtered = filtered.filter((cluster) => {
        const isBlacklisted = blacklist.includes(cluster.name.trim().toLowerCase());
        if (isBlacklisted) {
          logger.info({ cluster: cluster.name }, 'Cluster is blacklisted');
        }
        return !isBlacklisted;
      });
    }

    return filtered;
  }
}
