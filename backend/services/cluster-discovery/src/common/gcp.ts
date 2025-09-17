
import { v1 as googleContainerV1 } from '@google-cloud/container';
import assert from 'assert';

export async function getGKECredentials(clusterId: string, region: string, opts?: {
  projectId?: string,
}) {
  const client = new googleContainerV1.ClusterManagerClient();

  const projectId = opts?.projectId ?? process.env.APPLICATION_PLANE_PROJECT_ID;
  assert(projectId, 'Env var APPLICATION_PLANE_PROJECT_ID is required');
  const accessToken = await client.auth.getAccessToken();

  const [response] = await client.getCluster({
    name: `projects/${projectId}/locations/${region}/clusters/${clusterId}`,
  });
  // the following are the parameters added when a new k8s context is created
  return {
    endpoint: `https://${response.endpoint}`,
    certificateAuthority: response.masterAuth.clusterCaCertificate,
    accessToken: accessToken,
  };
}