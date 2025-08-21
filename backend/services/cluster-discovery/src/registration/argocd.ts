import { Cluster } from '../types';
import logger from '../logger';
import { KubeConfig, CoreV1Api, V1Secret } from '@kubernetes/client-node'
import { ARGOCD_NAMESPACE, CLUSTER_SECRET_NAME_PREFIX } from '../constants';

export async function createClusterSecret(cluster: Cluster): Promise<void> {
  logger.info({ clusterName: cluster.name }, 'Creating ArgoCD secret for cluster');

  const kubeconfig = new KubeConfig();
  kubeconfig.loadFromDefault();

  const k8sApi = kubeconfig.makeApiClient(CoreV1Api);

  try {
    await k8sApi.createNamespacedSecret({ namespace: ARGOCD_NAMESPACE, body: makeSecret(cluster) });
    logger.info({ clusterName: cluster.name }, 'Successfully created ArgoCD secret for cluster');
  } catch (error) {
    logger.error({ clusterName: cluster.name, error }, 'Failed to create ArgoCD secret for cluster');
  }
}

export async function updateClusterSecret(cluster: Cluster): Promise<void> {
  logger.info({ clusterName: cluster.name }, 'Updating ArgoCD secret for cluster');

  const kubeconfig = new KubeConfig();
  kubeconfig.loadFromDefault();

  const k8sApi = kubeconfig.makeApiClient(CoreV1Api);

  try {
    await k8sApi.patchNamespacedSecret({ name: `${CLUSTER_SECRET_NAME_PREFIX}${cluster.name}`, namespace: ARGOCD_NAMESPACE, body: makeSecret(cluster) });
    logger.info({ clusterName: cluster.name }, 'Successfully updated ArgoCD secret for cluster');
  } catch (error) {
    logger.error({ clusterName: cluster.name, error }, 'Failed to update ArgoCD secret for cluster');
  }
}

export async function listClusterSecrets(): Promise<{ name: string, labels: { [key: string]: string } }[]> {
  const kubeconfig = new KubeConfig();
  kubeconfig.loadFromDefault();

  const k8sApi = kubeconfig.makeApiClient(CoreV1Api);

  try {
    const secrets = await k8sApi.listNamespacedSecret({ namespace: ARGOCD_NAMESPACE });
    return secrets.items.map(s => ({
      name: s.metadata.name,
      labels: s.metadata.labels || {},
    }));
  } catch (error) {
    logger.error({ error }, 'Failed to list ArgoCD secrets');
    return [];
  }
}

export async function deleteClusterSecret(clusterName: string): Promise<void> {
  const kubeconfig = new KubeConfig();
  kubeconfig.loadFromDefault();

  const k8sApi = kubeconfig.makeApiClient(CoreV1Api);

  try {
    await k8sApi.deleteNamespacedSecret({ name: `${CLUSTER_SECRET_NAME_PREFIX}${clusterName}`, namespace: ARGOCD_NAMESPACE });
    logger.info({ clusterName }, 'Successfully deleted ArgoCD secret for cluster');
  } catch (error) {
    logger.error({ clusterName, error }, 'Failed to delete ArgoCD secret for cluster');
  }
}

export function makeClusterLabels(cluster: Cluster): { [key: string]: string } {
  return {
    ...cluster.labels,
    'argocd.argoproj.io/secret-type': 'cluster',
    'cloud_provider': cluster.cloud,
    'region': cluster.region,
    'role': 'app-plane',
  };
}

function makeSecret(cluster: Cluster): V1Secret {
  return {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      name: `${CLUSTER_SECRET_NAME_PREFIX}${cluster.name}`,
      namespace: ARGOCD_NAMESPACE,
      labels: {
        ...makeClusterLabels(cluster),
      }
    },
    data: makeSecretData(cluster),
  };
}

function makeSecretData(cluster: Cluster): { [key: string]: string; } {
  switch (cluster.cloud) {
    case 'gcp':
      return {
        name: cluster.name,
        server: cluster.endpoint,
        config: Buffer.from(JSON.stringify({
          "execProviderConfig": {
            "command": "argocd-k8s-auth",
            "args": ["gcp"],
            "apiVersion": "client.authentication.k8s.io/v1beta1"
          },
          "tlsClientConfig": {
            "insecure": false,
            "caData": cluster.caData,
          }
        })).toString('base64')
      };
    default:
      throw new Error(`Unsupported cloud provider: ${cluster.cloud}`);
  }
}