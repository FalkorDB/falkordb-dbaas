import { ClusterSchema, Cluster } from '../types';
import logger from '../logger';
import { ClientSecretCredential } from '@azure/identity';
import { ContainerServiceClient, ManagedCluster } from '@azure/arm-containerservice';
import { load } from 'js-yaml';

export async function discoverAzureClusters(): Promise<{ clusters: Cluster[] }> {
  logger.info('Discovering Azure AKS clusters...');

  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
  if (!subscriptionId) {
    logger.error('AZURE_SUBSCRIPTION_ID environment variable is not set.');
    return { clusters: [] };
  }

  const credential = new ClientSecretCredential(process.env.AZURE_TENANT_ID, process.env.AZURE_AAD_SERVICE_PRINCIPAL_CLIENT_ID, process.env.AZURE_AAD_SERVICE_PRINCIPAL_CLIENT_SECRET);
  const client = new ContainerServiceClient(credential, subscriptionId);

  const clusters: Cluster[] = [];

  for await (const cluster of client.managedClusters.list()) {
    logger.debug(`Discovered Azure Azure cluster: ${cluster.name}`);

    // Check if critical properties exist before proceeding
    if (!cluster.name || !cluster.fqdn || !cluster.kubernetesVersion || !cluster.location || !cluster.agentPoolProfiles) {
      logger.warn(`Skipping cluster due to missing properties: ${cluster.name || 'Unknown'}`);
      continue;
    }

    const resourceGroup = cluster.id.split('/')[4];

    await verifyOIDCEnabled(client, cluster, resourceGroup);

    // Extract CA from kubeconfig value
    const kubeconfigValue = (
      (
        await client.managedClusters.listClusterAdminCredentials(resourceGroup, cluster.name)
      )?.kubeconfigs?.[0]?.value
    );
    let caData = '';
    try {
      const kubeconfig: any = load(Buffer.from(kubeconfigValue).toString('utf-8'));
      caData = kubeconfig?.clusters?.[0]?.cluster?.['certificate-authority-data'] ?? '';
    } catch (err) {
      logger.error(err, `Failed to extract CA data from kubeconfig for cluster ${cluster.name}`);
    }

    clusters.push({
      name: cluster.name,
      endpoint: `https://${cluster.fqdn}`,
      labels: cluster.tags,
      cloud: 'azure',
      region: cluster.location,
      secretConfig: {
        execProviderConfig: {
          command: "argocd-k8s-auth",
          env: {
            AAD_ENVIRONMENT_NAME: "AzurePublicCloud",
            AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID,
            AZURE_TENANT_ID: process.env.AZURE_TENANT_ID,
            AZURE_FEDERATED_TOKEN_FILE: process.env.AZURE_FEDERATED_TOKEN_FILE,
            AZURE_AUTHORITY_HOST: process.env.AZURE_AUTHORITY_HOST,
            // AAD_SERVICE_PRINCIPAL_CLIENT_ID: process.env.AZURE_AAD_SERVICE_PRINCIPAL_CLIENT_ID,
            // AAD_SERVICE_PRINCIPAL_CLIENT_SECRET: process.env.AZURE_AAD_SERVICE_PRINCIPAL_CLIENT_SECRET,
            AAD_LOGIN_METHOD: "workloadidentity"
          },
          args: ["azure"],
          apiVersion: "client.authentication.k8s.io/v1beta1"
        },
        tlsClientConfig: {
          insecure: false,
          caData
        }
      }
    });
  }

  const validClusters = clusters.filter((c): c is Cluster => c !== null);

  logger.info({ clusterCount: validClusters.length }, `Found ${validClusters.length} Azure AKS clusters.`);

  // Validate clusters
  return { clusters: validClusters.map((cluster) => ClusterSchema.validateSync(cluster)) };
}

async function verifyOIDCEnabled(client: ContainerServiceClient, cluster: ManagedCluster, resourceGroup: string) {
  // Checks if OIDC issuer profile is enabled for the AKS cluster
  if (!cluster.oidcIssuerProfile || !cluster.oidcIssuerProfile.enabled) {
    logger.info(`Enabling OIDC issuer for cluster: ${cluster.name}`);
    try {
      await client.managedClusters.beginCreateOrUpdateAndWait(resourceGroup, cluster.name!, {
        location: cluster.location,
        oidcIssuerProfile: {
          enabled: true,
        }
      });
      logger.info(`OIDC issuer enabled for cluster: ${cluster.name}`)
    } catch (error) {
      logger.error(error, `Failed to enable OIDC issuer for cluster ${cluster.name}`)
    }
  } else {
    logger.debug(`OIDC issuer profile is enabled for cluster: ${cluster.name}`);
  }

}