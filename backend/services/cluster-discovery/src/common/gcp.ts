import { v1 as googleContainerV1 } from '@google-cloud/container';
import assert from 'assert';
import { Cluster } from '../types';

export async function getGKECredentials(
  cluster: Cluster,
  opts?: {
    projectId?: string;
  },
) {
  const client = new googleContainerV1.ClusterManagerClient();

  const projectId = opts?.projectId ?? process.env.APPLICATION_PLANE_GOOGLE_CLOUD_PROJECT;
  assert(projectId, 'Env var APPLICATION_PLANE_GOOGLE_CLOUD_PROJECT is required');
  const accessToken = await client.auth.getAccessToken();

  const [response] = await client.getCluster({
    name: `projects/${projectId}/locations/${cluster.region}/clusters/${cluster.name}`,
  });
  // the following are the parameters added when a new k8s context is created
  return {
    endpoint: `https://${response.endpoint}`,
    certificateAuthority: response.masterAuth.clusterCaCertificate,
    accessToken: accessToken,
  };
}
