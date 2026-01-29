import logger from '../logger';
import { OmnistrateClient } from '../providers/omnistrate/client';
import { deleteObservabilityNodePool } from '../providers';
import { Cluster } from '../types';

interface DeploymentCell {
  cloudProvider: 'gcp' | 'aws' | 'azure';
  region: string;
  id: string;
  status: string;
  modelType: string;
  destinationAccountID: string;
}

export async function handleCellDeletion(deploymentCellId: string): Promise<void> {
  logger.info({ deploymentCellId }, 'Starting cell deletion process');

  const omnistrateClient = initializeOmnistrateClient();
  const deploymentCell = await fetchDeploymentCell(omnistrateClient, deploymentCellId);

  const clusterName = buildClusterName(deploymentCell.cloudProvider, deploymentCellId);
  const cluster = await buildClusterConfig(omnistrateClient, deploymentCell, clusterName);

  await deleteNodePool(cluster, deploymentCellId, clusterName);
}

function initializeOmnistrateClient(): OmnistrateClient {
  return new OmnistrateClient(
    process.env.OMNISTRATE_USER!,
    process.env.OMNISTRATE_PASSWORD!,
    process.env.OMNISTRATE_SERVICE_ID,
    process.env.OMNISTRATE_ENVIRONMENT_ID,
    process.env.OMNISTRATE_BYOC_PRODUCT_TIER_ID,
  );
}

async function fetchDeploymentCell(client: OmnistrateClient, deploymentCellId: string): Promise<DeploymentCell> {
  const deploymentCell = await client.getDeploymentCell(deploymentCellId);

  if (!deploymentCell) {
    throw new Error(`Deployment cell ${deploymentCellId} not found`);
  }

  logger.info(
    {
      deploymentCellId,
      cloudProvider: deploymentCell.cloudProvider,
      region: deploymentCell.region,
      modelType: deploymentCell.modelType,
    },
    'Retrieved deployment cell details',
  );

  return deploymentCell;
}

function buildClusterName(cloudProvider: string, deploymentCellId: string): string {
  return cloudProvider === 'gcp' && !deploymentCellId.startsWith('c-')
    ? `c-${deploymentCellId.replace(/-/g, '')}`
    : deploymentCellId;
}

async function buildClusterConfig(
  client: OmnistrateClient,
  deploymentCell: DeploymentCell,
  clusterName: string,
): Promise<Partial<Cluster>> {
  if (deploymentCell.modelType === 'BYOA') {
    return buildBYOAClusterConfig(client, deploymentCell, clusterName);
  }

  return buildManagedClusterConfig(deploymentCell, clusterName);
}

async function buildBYOAClusterConfig(
  client: OmnistrateClient,
  deploymentCell: DeploymentCell,
  clusterName: string,
): Promise<Partial<Cluster>> {
  const [cloudAccounts, credentials] = await Promise.all([
    client.getBYOCCloudAccounts(),
    client.getDeploymentCellCredentials(deploymentCell.id),
  ]);

  const account = cloudAccounts.find(
    (acc) =>
      acc.cloudProvider === deploymentCell.cloudProvider && acc.cloudAccountId === deploymentCell.destinationAccountID,
  );

  if (!account) {
    logger.warn(
      {
        deploymentCellId: deploymentCell.id,
        destinationAccountID: deploymentCell.destinationAccountID,
      },
      'Could not find BYOC cloud account for deployment cell',
    );
  }

  return {
    name: clusterName,
    cloud: deploymentCell.cloudProvider,
    region: deploymentCell.region,
    endpoint: credentials.apiServerEndpoint,
    destinationAccountID: deploymentCell.destinationAccountID,
    secretConfig: {
      tlsClientConfig: {
        insecure: false,
        caData: credentials.caDataBase64,
        certData: credentials.clientCertificateDataBase64,
        keyData: credentials.clientKeyDataBase64,
      },
      bearerToken: credentials.serviceAccountToken,
    },
    hostMode: 'byoa' as const,
    destinationAccountNumber: account?.cloudAccountNumber,
    organizationId: account?.organizationId,
  };
}

function buildManagedClusterConfig(deploymentCell: DeploymentCell, clusterName: string): Partial<Cluster> {
  return {
    name: clusterName,
    cloud: deploymentCell.cloudProvider,
    region: deploymentCell.region,
    hostMode: 'managed' as const,
  };
}

async function deleteNodePool(cluster: Partial<Cluster>, deploymentCellId: string, clusterName: string): Promise<void> {
  const hostMode = cluster.hostMode || 'managed';

  logger.info({ deploymentCellId, clusterName, hostMode }, `Deleting observability node pool for ${hostMode} cluster`);

  await deleteObservabilityNodePool(cluster as Cluster);

  logger.info({ deploymentCellId, clusterName }, 'Successfully deleted observability node pool');
}
