import { Cluster } from '../../types';
import logger from '../../logger';
import { EKSClient, DeleteNodegroupCommand, DescribeNodegroupCommand } from '@aws-sdk/client-eks';
import { getAWSCredentials } from './client';

export async function deleteObservabilityNodePool(cluster: Cluster): Promise<void> {
  try {
    const credentials = await getAWSCredentials();
    const eksClient = new EKSClient({ credentials, region: cluster.region });

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

    logger.info({ cluster: cluster.name }, 'Observability node pool deletion initiated.');
  } catch (error) {
    logger.error(
      { 
        cluster: cluster.name, 
        error, 
        errorName: (error as any)?.name, 
        errorMessage: (error as any)?.message 
      },
      'Failed to delete observability node pool'
    );
    throw error;
  }
}
