import { Cluster } from '../../types';
import logger from '../../logger';
import { EKSClient, DescribeClusterCommand, CreateNodegroupCommand, DescribeNodegroupCommand, UpdateNodegroupConfigCommand } from '@aws-sdk/client-eks';
import { getAWSCredentials } from './client';
import { AWS } from '../../constants';

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

    const nodePools = awsCluster?.computeConfig?.nodePools;

    if (nodePools?.includes("observability")) {
      // Node pool exists - check if scaling config needs updating
      try {
        const { nodegroup } = await eksClient.send(
          new DescribeNodegroupCommand({
            clusterName: cluster.name,
            nodegroupName: 'observability',
          })
        );

        let updated = false;

        const scalingNeedsUpdate =
          nodegroup?.scalingConfig?.minSize !== AWS.DEFAULT_MIN_NODES ||
          nodegroup?.scalingConfig?.maxSize !== AWS.DEFAULT_MAX_NODES;

        if (scalingNeedsUpdate) {
          await eksClient.send(
            new UpdateNodegroupConfigCommand({
              clusterName: cluster.name,
              nodegroupName: 'observability',
              scalingConfig: {
                minSize: AWS.DEFAULT_MIN_NODES,
                maxSize: AWS.DEFAULT_MAX_NODES,
                desiredSize: Math.max(nodegroup?.scalingConfig?.desiredSize ?? 1, AWS.DEFAULT_MIN_NODES),
              },
              labels: {
                addOrUpdateLabels: { node_pool: 'observability' },
              },
            })
          );
          updated = true;
        }

        // Warn if instance type doesn't match (can't be changed in-place)
        const currentInstanceTypes = nodegroup?.instanceTypes || [];
        if (!currentInstanceTypes.includes(AWS.DEFAULT_INSTANCE_TYPE)) {
          logger.warn(
            { cluster: cluster.name, current: currentInstanceTypes, desired: AWS.DEFAULT_INSTANCE_TYPE },
            'Observability node pool instance type mismatch - requires nodegroup recreation to change',
          );
        }

        if (updated) {
          logger.info({ cluster: cluster.name }, 'Observability node pool updated.');
        } else {
          logger.info({ cluster: cluster.name }, 'Observability node pool already up to date.');
        }
      } catch (describeError) {
        logger.warn({ cluster: cluster.name, error: describeError }, 'Could not describe/update existing observability nodegroup');
      }
      return;
    }

    const subnetIds = awsCluster?.resourcesVpcConfig?.subnetIds;
    const envNodeRole = process.env.OMNISTRATE_AWS_NODE_ROLE_ARN;
    const clusterNodeRole = awsCluster?.computeConfig?.nodeRoleArn;
    const nodeRole = envNodeRole && envNodeRole.trim() !== '' ? envNodeRole : clusterNodeRole;

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
        instanceTypes: [AWS.DEFAULT_INSTANCE_TYPE],
        diskSize: AWS.DEFAULT_DISK_SIZE_GB,
        scalingConfig: {
          minSize: AWS.DEFAULT_MIN_NODES,
          maxSize: AWS.DEFAULT_MAX_NODES,
          desiredSize: 1
        },
        labels: {
          node_pool: "observability"
        }
      })
    );

    logger.info({ cluster: cluster.name }, 'Observability node pool created.');
  } catch (error) {
    logger.error({ cluster: cluster.name, error, errorName: (error as any)?.name, errorMessage: (error as any)?.message }, 'Failed to ensure observability node pool');
  }
}

export async function createSecurityNodePool(cluster: Cluster): Promise<void> {
  try {
    const credentials = await getAWSCredentials();
    const eksClient = new EKSClient({ credentials, region: cluster.region });

    const { cluster: awsCluster } = await eksClient.send(
      new DescribeClusterCommand({ name: cluster.name }),
    );

    const nodePools = awsCluster?.computeConfig?.nodePools;

    if (nodePools?.includes('security')) {
      // Node pool exists - check if scaling config needs updating
      try {
        const { nodegroup } = await eksClient.send(
          new DescribeNodegroupCommand({
            clusterName: cluster.name,
            nodegroupName: 'security',
          })
        );

        let updated = false;

        const scalingNeedsUpdate =
          nodegroup?.scalingConfig?.minSize !== AWS.SECURITY_MIN_NODES ||
          nodegroup?.scalingConfig?.maxSize !== AWS.SECURITY_MAX_NODES;

        if (scalingNeedsUpdate) {
          await eksClient.send(
            new UpdateNodegroupConfigCommand({
              clusterName: cluster.name,
              nodegroupName: 'security',
              scalingConfig: {
                minSize: AWS.SECURITY_MIN_NODES,
                maxSize: AWS.SECURITY_MAX_NODES,
                desiredSize: Math.max(nodegroup?.scalingConfig?.desiredSize ?? 0, AWS.SECURITY_MIN_NODES),
              },
              labels: {
                addOrUpdateLabels: { node_pool: 'security' },
              },
            })
          );
          updated = true;
        }

        const currentInstanceTypes = nodegroup?.instanceTypes || [];
        if (!currentInstanceTypes.includes(AWS.SECURITY_INSTANCE_TYPE)) {
          logger.warn(
            { cluster: cluster.name, current: currentInstanceTypes, desired: AWS.SECURITY_INSTANCE_TYPE },
            'Security node pool instance type mismatch - requires nodegroup recreation to change',
          );
        }

        if (updated) {
          logger.info({ cluster: cluster.name }, 'Security node pool updated.');
        } else {
          logger.info({ cluster: cluster.name }, 'Security node pool already up to date.');
        }
      } catch (describeError) {
        logger.warn({ cluster: cluster.name, error: describeError }, 'Could not describe/update existing security nodegroup');
      }
      return;
    }

    const subnetIds = awsCluster?.resourcesVpcConfig?.subnetIds;
    const envNodeRole = process.env.OMNISTRATE_AWS_NODE_ROLE_ARN;
    const clusterNodeRole = awsCluster?.computeConfig?.nodeRoleArn;
    const nodeRole = envNodeRole && envNodeRole.trim() !== '' ? envNodeRole : clusterNodeRole;

    if (!nodeRole) {
      const message = 'AWS node role ARN is not configured. Set OMNISTRATE_AWS_NODE_ROLE_ARN or ensure awsCluster.computeConfig.nodeRoleArn is set.';
      logger.error({ cluster: cluster.name }, message);
      throw new Error(message);
    }

    await eksClient.send(
      new CreateNodegroupCommand({
        clusterName: cluster.name,
        nodegroupName: 'security',
        subnets: subnetIds,
        nodeRole: nodeRole,
        instanceTypes: [AWS.SECURITY_INSTANCE_TYPE],
        diskSize: AWS.DEFAULT_DISK_SIZE_GB,
        scalingConfig: {
          minSize: AWS.SECURITY_MIN_NODES,
          maxSize: AWS.SECURITY_MAX_NODES,
          desiredSize: 0,
        },
        labels: {
          node_pool: 'security',
        },
      }),
    );

    logger.info({ cluster: cluster.name }, 'Security node pool created.');
  } catch (error) {
    logger.error({ cluster: cluster.name, error, errorName: (error as any)?.name, errorMessage: (error as any)?.message }, 'Failed to ensure security node pool');
  }
}