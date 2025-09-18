import * as k8s from '@kubernetes/client-node'; import { DescribeClusterCommand, EKSClient } from '@aws-sdk/client-eks';
import { getEKSCredentials } from './aws';
import { getGKECredentials } from './gcp';


export async function getK8sConfig(
  cloudProvider: 'gcp' | 'aws' | 'azure',
  clusterId: string,
  region: string,
  opts?: {
    projectId?: string,
  }
): Promise<k8s.KubeConfig> {
  const k8sCredentials =
    cloudProvider === 'gcp'
      ? await getGKECredentials(clusterId, region, opts)
      : await getEKSCredentials(clusterId, region);

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