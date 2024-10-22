// Test the K8sRepository class
import { K8sRepository } from './K8sRepository';
import pino from 'pino';

describe('K8sRepository', () => {
  it('should get the FalkorDB info', async () => {
    const logger = pino();
    const k8sRepo = new K8sRepository({ logger });
    try {
      const instanceInfo = await k8sRepo.getFalkorDBInfo('c-hcjx5tis6bc', 'us-central1', 'instance-y9up7yqzz', true);
      console.log(instanceInfo);

      expect(instanceInfo.rdb_bgsave_in_progress).toBeDefined();
      expect(instanceInfo.rdb_saves).toBeDefined();
      expect(instanceInfo.rdb_last_save_time).toBeDefined();
      expect(instanceInfo.rdb_changes_since_last_save).toBeDefined();
    } catch (error) {
      console.error('Error getting FalkorDB info', error);
      throw error;
    }
  }, 60000);
});
