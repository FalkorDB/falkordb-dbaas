import {
  createClusterSecret,
  deleteClusterSecret,
  listClusterSecrets,
  makeClusterLabels,
  updateClusterSecret,
  rotateAWSSecret,
} from '../integrations/argocd';
import { isEqual } from 'lodash';
import logger from '../logger';
import { Cluster } from '../types';

export interface ClusterSecret {
  name: string;
  labels: Record<string, string>;
}

export class RegistrationService {
  async getExistingSecrets(): Promise<ClusterSecret[]> {
    return await listClusterSecrets();
  }

  async registerOrUpdateCluster(cluster: Cluster, existingSecret?: ClusterSecret): Promise<void> {
    if (existingSecret) {
      // Update if labels changed or it's a BYOA cluster
      if (!isEqual(makeClusterLabels(cluster), existingSecret.labels) || cluster.hostMode === 'byoa') {
        await updateClusterSecret(existingSecret.name, cluster);
        logger.info({ cluster: cluster.name }, 'Updated cluster secret');
      } else {
        logger.debug({ cluster: cluster.name }, 'Cluster secret unchanged');
      }
    } else {
      // Create new cluster secret
      await createClusterSecret(cluster);
      logger.info({ cluster: cluster.name }, 'Created new cluster secret');
    }
  }

  async deregisterCluster(secretName: string, shouldDelete: boolean): Promise<void> {
    if (shouldDelete) {
      await deleteClusterSecret(secretName);
      logger.info({ secret: secretName }, 'Deleted cluster secret');
    } else {
      logger.info({ secret: secretName }, 'Skipping deletion (DELETE_UNKNOWN_SECRETS not set to true)');
    }
  }

  async rotateAWSCredentials(credentials: any): Promise<void> {
    if (credentials) {
      await rotateAWSSecret(credentials);
      logger.info('Rotated AWS credentials');
    }
  }

  isControlPlaneSecret(secret: ClusterSecret): boolean {
    return secret.name.startsWith('cluster-kubernetes.default.svc') || secret.labels['role'] === 'ctrl-plane';
  }
}
