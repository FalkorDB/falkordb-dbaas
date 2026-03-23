import { ClientSecretCredential } from '@azure/identity';
import { ContainerServiceClient } from '@azure/arm-containerservice';
import { load } from 'js-yaml';
import { Cluster } from '../../types';
import logger from '../../logger';

export function createAzureCredential(): ClientSecretCredential {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error(
      'Azure credentials are not configured. AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET must be set.',
    );
  }

  return new ClientSecretCredential(tenantId, clientId, clientSecret);
}

export function createContainerServiceClient(): ContainerServiceClient {
  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
  if (!subscriptionId) {
    throw new Error('AZURE_SUBSCRIPTION_ID environment variable is not set.');
  }

  const credential = createAzureCredential();
  return new ContainerServiceClient(credential, subscriptionId);
}

/**
 * Finds the resource group containing the named AKS cluster by listing all
 * managed clusters in the subscription.
 */
export async function getResourceGroupForCluster(clusterName: string): Promise<string> {
  const client = createContainerServiceClient();
  for await (const cluster of client.managedClusters.list()) {
    if (cluster.name === clusterName) {
      const parts = cluster.id?.split('/');
      if (parts && parts.length > 4) {
        return parts[4];
      }
    }
  }
  throw new Error(`Could not find Azure AKS cluster '${clusterName}' to determine its resource group`);
}

/**
 * Returns the AKS cluster credentials (endpoint, CA data, access token)
 * analogous to getGKECredentials / getEKSCredentials.
 */
export async function getAKSCredentials(cluster: Cluster): Promise<{
  endpoint: string;
  certificateAuthority: string;
  accessToken: string;
}> {
  const credential = createAzureCredential();
  const client = createContainerServiceClient();

  const resourceGroup =
    cluster.labels?.['azure-resource-group'] ?? (await getResourceGroupForCluster(cluster.name));

  const managedCluster = await client.managedClusters.get(resourceGroup, cluster.name);

  if (!managedCluster.fqdn) {
    throw new Error(`Azure AKS cluster '${cluster.name}' has no FQDN`);
  }

  const credResult = await client.managedClusters.listClusterAdminCredentials(resourceGroup, cluster.name);
  const kubeconfigValue = credResult?.kubeconfigs?.[0]?.value;

  let certificateAuthority = '';
  try {
    const kubeconfig: any = load(Buffer.from(kubeconfigValue).toString('utf-8'));
    certificateAuthority = kubeconfig?.clusters?.[0]?.cluster?.['certificate-authority-data'] ?? '';
  } catch (err) {
    logger.error(err, `Failed to extract CA data from kubeconfig for cluster ${cluster.name}`);
  }

  // Use the AAD server application ID scope for AKS cluster access.
  // Falls back to the well-known Azure Kubernetes Service AAD Server Application ID
  // (6dae42f8-4368-4678-94ff-3960e28e3630), which is the default for AKS clusters
  // not configured with a custom AAD server application.
  const serverAppId =
    process.env.AAD_SERVER_APPLICATION_ID ?? '6dae42f8-4368-4678-94ff-3960e28e3630';
  const tokenResponse = await credential.getToken(`${serverAppId}/.default`);

  return {
    endpoint: `https://${managedCluster.fqdn}`,
    certificateAuthority,
    accessToken: tokenResponse.token,
  };
}
