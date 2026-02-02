import { createTargetClusterPagerDutySecret } from '../secrets/pagerduty';
import { createOrUpdateTargetClusterVMUserSecretJob } from '../secrets/vmuser';
import logger from '../logger';
import { Cluster } from '../types';

export class SecretManagementService {
  async createPagerDutySecret(cluster: Cluster): Promise<void> {
    try {
      await createTargetClusterPagerDutySecret(cluster);
      logger.info({ cluster: cluster.name }, 'PagerDuty secret created');
    } catch (error) {
      logger.error({ error, cluster: cluster.name }, 'Failed to create PagerDuty secret');
      // Don't throw - secret creation is non-critical
    }
  }

  async createOrUpdateVMUserSecret(cluster: Cluster): Promise<void> {
    try {
      await createOrUpdateTargetClusterVMUserSecretJob(cluster);
      logger.info({ cluster: cluster.name }, 'VMUser secret job created/updated');
    } catch (error) {
      logger.error({ error, cluster: cluster.name }, 'Failed to create/update VMUser secret');
      // Don't throw - secret creation is non-critical
    }
  }
}
