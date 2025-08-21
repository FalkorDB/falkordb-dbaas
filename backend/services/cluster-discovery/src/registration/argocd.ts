import { Cluster } from '../types';
import logger from '../logger';
import * as k8s from '@kubernetes/client-node'
import { ARGOCD_NAMESPACE } from '../constants';

export async function createClusterSecret(cluster: Cluster): Promise<void> {
  logger.info({ clusterName: cluster.name }, 'Creating ArgoCD secret for cluster');

  const kubeconfig = new k8s.KubeConfig();
  kubeconfig.loadFromDefault();

  const k8sApi = kubeconfig.makeApiClient(k8s.CoreV1Api);

  try {
    await k8sApi.createNamespacedSecret(ARGOCD_NAMESPACE, makeSecret(cluster));
    logger.info({ clusterName: cluster.name }, 'Successfully created ArgoCD secret for cluster');
  } catch (error) {
    logger.error({ clusterName: cluster.name, error }, 'Failed to create ArgoCD secret for cluster');
  }
}

export async function updateClusterSecret(secretName: string, cluster: Cluster): Promise<void> {
  logger.info({ clusterName: cluster.name }, 'Updating ArgoCD secret for cluster');

  const kubeconfig = new k8s.KubeConfig();
  kubeconfig.loadFromDefault();

  const k8sApi = kubeconfig.makeApiClient(k8s.CoreV1Api);

  try {
    await k8sApi.patchNamespacedSecret(secretName, ARGOCD_NAMESPACE, makeSecret(cluster), undefined, undefined, undefined, undefined, undefined, {
      headers: {
        'Content-Type': 'application/merge-patch+json'
      }
    });
    logger.info({ clusterName: cluster.name }, 'Successfully updated ArgoCD secret for cluster');
  } catch (error) {
    logger.error({ clusterName: cluster.name, error }, 'Failed to update ArgoCD secret for cluster');
  }
}

export async function listClusterSecrets(): Promise<{ name: string, labels: { [key: string]: string } }[]> {
  const kubeconfig = new k8s.KubeConfig();
  kubeconfig.loadFromDefault();

  const k8sApi = kubeconfig.makeApiClient(k8s.CoreV1Api);

  try {
    const secrets = await k8sApi.listNamespacedSecret(ARGOCD_NAMESPACE, undefined, undefined, undefined, undefined, "argocd.argoproj.io/secret-type=cluster");
    return secrets.body.items.map(s => ({
      name: s.metadata.name,
      labels: s.metadata.labels || {},
    }));
  } catch (error) {
    logger.error({ error }, 'Failed to list ArgoCD secrets');
    return [];
  }
}

export async function deleteClusterSecret(secretName: string): Promise<void> {
  const kubeconfig = new k8s.KubeConfig();
  kubeconfig.loadFromDefault();

  const k8sApi = kubeconfig.makeApiClient(k8s.CoreV1Api);

  try {
    await k8sApi.deleteNamespacedSecret(`${secretName}`, ARGOCD_NAMESPACE);
    logger.info({ secretName }, 'Successfully deleted ArgoCD secret for cluster');
  } catch (error) {
    logger.error({ secretName, error }, 'Failed to delete ArgoCD secret for cluster');
  }
}

export function makeClusterLabels(cluster: Cluster): { [key: string]: string } {
  return {
    ...cluster.labels,
    cluster: cluster.name,
    'argocd.argoproj.io/secret-type': 'cluster',
    'cloud_provider': cluster.cloud,
    'region': cluster.region,
    'role': 'app-plane',
  };
}

function makeSecret(cluster: Cluster): k8s.V1Secret {
  return {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      name: `${cluster.name}`,
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
        name: Buffer.from(cluster.name).toString('base64'),
        server: Buffer.from(cluster.endpoint).toString('base64'),
        config: Buffer.from(JSON.stringify({
          execProviderConfig: {
            command: 'argocd-k8s-auth',
            args: ['gcp'],
            apiVersion: 'client.authentication.k8s.io/v1beta1'
          },
          tlsClientConfig: {
            insecure: false,
            caData: cluster.caData,
          }
        })).toString('base64')
      };
    default:
      throw new Error(`Unsupported cloud provider: ${cluster.cloud}`);
  }
}