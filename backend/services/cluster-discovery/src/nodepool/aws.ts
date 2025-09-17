import { Cluster } from '../types';
import logger from '../logger';
import { EKSClient, DescribeClusterCommand, CreateNodegroupCommand } from '@aws-sdk/client-eks';
import { getAWSCredentials } from '../common/k8s';

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
    const nodeRole = awsCluster.computeConfig.nodeRoleArn;

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