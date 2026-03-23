import { Cluster } from '../../types';
import logger from '../../logger';
import { EKSClient, DeleteNodegroupCommand, DescribeNodegroupCommand } from '@aws-sdk/client-eks';
import { ClusterManagerClient } from '@google-cloud/container';
import { ContainerServiceClient } from '@azure/arm-containerservice';
import { getAWSBYOACredentials, getAzureBYOACredentials, getGCPBYOACredentials } from './credentials';

export async function deleteObservabilityNodePoolGCPBYOA(cluster: Cluster): Promise<void> {
  try {
    if (!cluster.gcpAccountID || !cluster.gcpAccountNumber) {
      logger.error({ cluster: cluster.name }, 'Missing gcpAccountID or gcpAccountNumber for BYOA cluster');
      return;
    }

    const { authClient } = await getGCPBYOACredentials(cluster).catch((error) => {
      logger.error(
        {
          cluster: cluster.name,
          errorName: error?.name,
          errorMessage: error?.message,
          errorStack: error?.stack,
          errorDetails: error,
        },
        'Failed to get GCP BYOA credentials',
      );
      throw error;
    });

    // Create GCP client with Impersonated credentials
    // Using authClient property (not auth) as it bypasses some gRPC plugin issues
    const client = new ClusterManagerClient({
      authClient: authClient as any,
    });

    const [nodePools] = await client
      .listNodePools({
        parent: `projects/${cluster.gcpAccountID}/locations/${cluster.region}/clusters/${cluster.name}`,
      })
      .catch((error) => {
        logger.error(
          {
            cluster: cluster.name,
            errorName: error?.name,
            errorMessage: error?.message,
            errorStack: error?.stack,
            errorDetails: error,
          },
          'Failed to list node pools for BYOA GCP cluster',
        );
        throw error;
      });

    const exists = nodePools.nodePools?.some((np) => np.name === 'observability');

    if (!exists) {
      logger.info({ cluster: cluster.name }, 'Observability node pool does not exist, nothing to delete.');
      return;
    }

    await client.deleteNodePool({
      name: `projects/${cluster.gcpAccountID}/locations/${cluster.region}/clusters/${cluster.name}/nodePools/observability`,
    });

    logger.info({ cluster: cluster.name }, 'Observability node pool deleted for BYOA GCP cluster.');
  } catch (error) {
    logger.error(
      {
        cluster: cluster.name,
        errorName: (error as any)?.name,
        errorMessage: (error as any)?.message,
        errorStack: (error as any)?.stack,
        errorDetails: error,
      },
      'Failed to delete observability node pool for BYOA GCP cluster',
    );
    throw error;
  }
}

export async function deleteObservabilityNodePoolAWSBYOA(cluster: Cluster): Promise<void> {
  try {
    if (!cluster.awsAccountID || !cluster.awsRoleARN) {
      logger.error({ cluster: cluster.name }, 'Missing AWS credentials for BYOA cluster');
      return;
    }

    const credentials = await getAWSBYOACredentials(cluster);

    const eksClient = new EKSClient({
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      },
      region: cluster.region,
    });

    // Check if node group exists
    try {
      await eksClient.send(
        new DescribeNodegroupCommand({
          clusterName: cluster.name,
          nodegroupName: 'observability',
        }),
      );
    } catch (error: any) {
      if (error.name === 'ResourceNotFoundException') {
        logger.info({ cluster: cluster.name }, 'Observability node pool does not exist, nothing to delete.');
        return;
      }
      throw error;
    }

    // Delete the observability node group
    await eksClient.send(
      new DeleteNodegroupCommand({
        clusterName: cluster.name,
        nodegroupName: 'observability',
      }),
    );

    logger.info({ cluster: cluster.name }, 'Observability node pool deletion initiated for BYOA AWS cluster.');
  } catch (error) {
    logger.error(
      {
        cluster: cluster.name,
        errorName: (error as any)?.name,
        errorMessage: (error as any)?.message,
        errorStack: (error as any)?.stack,
        errorDetails: error,
      },
      'Failed to delete observability node pool for BYOA AWS cluster',
    );
    throw error;
  }
}

// AKS agent pool names must be 1-12 chars, lowercase alphanumeric.
const OBSERVABILITY_POOL_NAME = 'obsrv';

export async function deleteObservabilityNodePoolAzureBYOA(cluster: Cluster): Promise<void> {
  try {
    if (!cluster.azureClientId || !cluster.azureTenantId || !cluster.azureResourceGroupName) {
      logger.error({ cluster: cluster.name }, 'Missing Azure credentials for BYOA Azure cluster');
      return;
    }

    const { subscriptionId, credential } = await getAzureBYOACredentials(cluster).catch((error) => {
      logger.error(
        {
          cluster: cluster.name,
          errorName: error?.name,
          errorMessage: error?.message,
          errorStack: error?.stack,
          errorDetails: error,
        },
        'Failed to get Azure BYOA credentials',
      );
      throw error;
    });

    const client = new ContainerServiceClient(credential, subscriptionId);

    // Check if the observability agent pool exists before attempting deletion
    try {
      await client.agentPools.get(cluster.azureResourceGroupName, cluster.name, OBSERVABILITY_POOL_NAME);
    } catch (error: any) {
      if (error.statusCode === 404 || error.code === 'ResourceNotFound' || error.code === 'AgentPoolNotFound') {
        logger.info({ cluster: cluster.name }, 'Observability node pool does not exist, nothing to delete.');
        return;
      }
      throw error;
    }

    await client.agentPools.beginDeleteAndWait(cluster.azureResourceGroupName, cluster.name, OBSERVABILITY_POOL_NAME);

    logger.info({ cluster: cluster.name }, 'Observability node pool deleted for BYOA Azure cluster.');
  } catch (error) {
    logger.error(
      {
        cluster: cluster.name,
        errorName: (error as any)?.name,
        errorMessage: (error as any)?.message,
        errorStack: (error as any)?.stack,
        errorDetails: error,
      },
      'Failed to delete observability node pool for BYOA Azure cluster',
    );
    throw error;
  }
}
