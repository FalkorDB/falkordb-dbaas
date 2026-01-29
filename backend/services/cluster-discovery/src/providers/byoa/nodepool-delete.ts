import { Cluster } from '../../types';
import logger from '../../logger';
import { EKSClient, DeleteNodegroupCommand, DescribeNodegroupCommand } from '@aws-sdk/client-eks';
import { ClusterManagerClient } from '@google-cloud/container';
import { getAWSBYOACredentials, getGCPBYOACredentials } from './credentials';

export async function deleteObservabilityNodePoolGCPBYOA(cluster: Cluster): Promise<void> {
  try {
    if (!cluster.destinationAccountID || !cluster.destinationAccountNumber) {
      logger.error(
        { cluster: cluster.name },
        'Missing destinationAccountID or destinationAccountNumber for BYOA cluster',
      );
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
        parent: `projects/${cluster.destinationAccountID}/locations/${cluster.region}/clusters/${cluster.name}`,
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
      name: `projects/${cluster.destinationAccountID}/locations/${cluster.region}/clusters/${cluster.name}/nodePools/observability`,
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
    if (!cluster.destinationAccountID) {
      logger.error({ cluster: cluster.name }, 'Missing destinationAccountID for BYOA cluster');
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
        })
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
      })
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
