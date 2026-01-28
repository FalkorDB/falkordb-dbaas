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
  const isBYOA = cluster.hostMode === 'byoa';

  const k8sCredentials = isBYOA
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
        token: isBYOA ? undefined : k8sCredentials.accessToken,
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
    
    if (isBYOA) {
      // For BYOA clusters, use client certificate authentication
      const certData = (cluster.secretConfig as any)?.tlsClientConfig?.certData;
      const keyData = (cluster.secretConfig as any)?.tlsClientConfig?.keyData;
      
      if (certData && keyData) {
        opts.cert = Buffer.from(certData, 'base64');
        opts.key = Buffer.from(keyData, 'base64');
      }
    } else if (k8sCredentials.accessToken) {
      // For managed clusters, use bearer token authentication
      opts.headers.Authorization = 'Bearer ' + k8sCredentials.accessToken;
    }
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
