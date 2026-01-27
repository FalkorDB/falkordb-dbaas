import * as k8s from '@kubernetes/client-node';
import { DescribeClusterCommand, EKSClient } from '@aws-sdk/client-eks';
import { getEKSCredentials } from './aws';
import { getGKECredentials } from './gcp';
import { Cluster } from '../types';

export async function getK8sConfig(
  cluster: Cluster,
  opts?: {
    projectId?: string;
  },
): Promise<k8s.KubeConfig> {
  const cloudProvider = cluster.cloud;
  const clusterId = cluster.name;

  const k8sCredentials =
    cluster.hostMode === 'byoa'
      ? getBYOACredentials(cluster)
      : cloudProvider === 'gcp'
        ? await getGKECredentials(cluster, opts)
        : await getEKSCredentials(cluster);

  const kubeConfig = new k8s.KubeConfig();
  kubeConfig.loadFromOptions({
    clusters: [
      {
        name: clusterId,
        caData: k8sCredentials.certificateAuthority,
        server: k8sCredentials.endpoint,
      },
    ],
    users: [
      {
        name: clusterId,
        authProvider: cloudProvider === 'gcp' ? cloudProvider : undefined,
        token: k8sCredentials.accessToken,
        certData: (cluster.secretConfig as any)?.tlsClientConfig?.certData,
        keyData: (cluster.secretConfig as any)?.tlsClientConfig?.keyData,
      },
    ],
    contexts: [
      {
        name: clusterId,
        user: clusterId,
        cluster: clusterId,
      },
    ],
    currentContext: clusterId,
  });

  kubeConfig.applyToRequest = async (opts) => {
    opts.ca = Buffer.from(k8sCredentials.certificateAuthority, 'base64');
    opts.headers.Authorization = 'Bearer ' + k8sCredentials.accessToken;
  };

  return kubeConfig;
}

function getBYOACredentials(cluster: Cluster): {
  endpoint: string;
  certificateAuthority: string;
  accessToken: string;
} {
  return {
    accessToken: (cluster.secretConfig as any)?.bearerToken || '',
    certificateAuthority: (cluster.secretConfig as any)?.tlsClientConfig?.caData || '',
    endpoint: cluster.endpoint,
  };
}
