import { ClusterDiscoveryService, ClusterDiscoveryConfig } from './services/ClusterDiscoveryService';
import { EnvConfig } from './schemas/env.schema';

export async function runDiscovery(envConfig: EnvConfig): Promise<void> {
  const config: ClusterDiscoveryConfig = {
    whitelist: envConfig.WHITELIST_CLUSTERS?.split(',')
      .map((name) => name.trim().toLowerCase())
      .filter(Boolean) || [],
    blacklist: envConfig.BLACKLIST_CLUSTERS?.split(',')
      .map((name) => name.trim().toLowerCase())
      .filter(Boolean) || [],
    deleteUnknownSecrets: envConfig.DELETE_UNKNOWN_SECRETS,
  };

  const service = new ClusterDiscoveryService(config);
  await service.run();
}
