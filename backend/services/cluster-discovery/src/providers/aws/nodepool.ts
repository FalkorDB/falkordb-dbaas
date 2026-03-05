import { Cluster } from '../../types';
import logger from '../../logger';
import { EKSClient, DescribeClusterCommand, CreateNodegroupCommand } from '@aws-sdk/client-eks';
import { getAWSCredentials } from './client';

export async function createObservabilityNodePool(cluster: Cluster): Promise<void> {
  try {

    const credentials = await getAWSCredentials();

    const eksClient = new EKSClient({ credentials, region: cluster.region });

    // List existing node groups
    const { cluster: awsCluster } = await eksClient.send(
      new DescribeClusterCommand({
        name: cluster.name
      })
    );

    const nodePools = awsCluster.computeConfig.nodePools;

    if (nodePools.includes("observability")) {
      logger.info({ cluster: cluster.name }, 'Observability node pool already exists.');
      return
    }

    const subnetIds = awsCluster.resourcesVpcConfig.subnetIds;
    const envNodeRole = process.env.OMNISTRATE_AWS_NODE_ROLE_ARN;
    const clusterNodeRole = awsCluster.computeConfig?.nodeRoleArn;
    const nodeRole = (envNodeRole && envNodeRole.trim() !== '') ? envNodeRole : clusterNodeRole;

    if (!nodeRole) {
      const message = 'AWS node role ARN is not configured. Set OMNISTRATE_AWS_NODE_ROLE_ARN or ensure awsCluster.computeConfig.nodeRoleArn is set.';
      logger.error({ cluster: cluster.name }, message);
      throw new Error(message);
    }

    // Create the observability node group
    await eksClient.send(
      new CreateNodegroupCommand({
        clusterName: cluster.name,
        nodegroupName: "observability",
        subnets: subnetIds,
        nodeRole: nodeRole,
        instanceTypes: ["m5.large"],
        diskSize: 50,
        scalingConfig: {
          minSize: 1,
          maxSize: 10,
          desiredSize: 1
        },
        labels: {
          node_pool: "observability"
        }
      })
    );

    logger.info({ cluster: cluster.name }, 'Observability node pool created.');
  } catch (error) {
    logger.error({ cluster: cluster.name, error, errorName: error.name, errorMessage: error.message }, 'Failed to create observability node pool');
  }
}