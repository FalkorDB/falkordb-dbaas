import { Cluster } from '../../types';
import logger from '../../logger';
import { EKSClient, DescribeClusterCommand, CreateNodegroupCommand, DescribeNodegroupCommand, UpdateNodegroupConfigCommand } from '@aws-sdk/client-eks';
import { ClusterManagerClient } from '@google-cloud/container';
import { ContainerServiceClient } from '@azure/arm-containerservice';
import { getAWSBYOACredentials, getAzureBYOACredentials, getGCPBYOACredentials } from './credentials';
import { GCP, AWS, AZURE } from '../../constants';

export async function createObservabilityNodePoolGCPBYOA(cluster: Cluster): Promise<void> {
  try {
    if (!cluster.gcpAccountID || !cluster.gcpAccountNumber) {
      logger.error(
        { cluster: cluster.name },
        'Missing gcpAccountID or gcpAccountNumber for BYOA cluster',
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

    const existingPool = nodePools.nodePools?.find((np) => np.name === 'observability');

    if (existingPool) {
      const parent = `projects/${cluster.gcpAccountID}/locations/${cluster.region}/clusters/${cluster.name}`;
      const poolName = `${parent}/nodePools/observability`;
      let updated = false;

      if (existingPool.config?.machineType !== GCP.DEFAULT_MACHINE_TYPE) {
        logger.info(
          { cluster: cluster.name, current: existingPool.config?.machineType, desired: GCP.DEFAULT_MACHINE_TYPE },
          'Updating BYOA GCP observability node pool machine type',
        );
        await client.updateNodePool({ name: poolName, machineType: GCP.DEFAULT_MACHINE_TYPE });
        updated = true;
      }

      if (
        !existingPool.autoscaling?.enabled ||
        existingPool.autoscaling?.maxNodeCount !== GCP.DEFAULT_MAX_NODES ||
        existingPool.autoscaling?.minNodeCount !== GCP.DEFAULT_MIN_NODES
      ) {
        await client.setNodePoolAutoscaling({
          name: poolName,
          autoscaling: { enabled: true, maxNodeCount: GCP.DEFAULT_MAX_NODES, minNodeCount: GCP.DEFAULT_MIN_NODES },
        });
        updated = true;
      }

      if (updated) {
        logger.info({ cluster: cluster.name }, 'Observability node pool updated for BYOA GCP cluster.');
      } else {
        logger.info({ cluster: cluster.name }, 'Observability node pool already up to date for BYOA GCP cluster.');
      }
      return;
    }

    await client.createNodePool({
      parent: `projects/${cluster.gcpAccountID}/locations/${cluster.region}/clusters/${cluster.name}`,
      nodePool: {
        name: 'observability',
        initialNodeCount: 1,
        config: {
          machineType: GCP.DEFAULT_MACHINE_TYPE,
          diskSizeGb: GCP.DEFAULT_DISK_SIZE_GB,
          labels: { node_pool: 'observability' },
        },
        autoscaling: {
          enabled: true,
          maxNodeCount: GCP.DEFAULT_MAX_NODES,
          minNodeCount: GCP.DEFAULT_MIN_NODES,
        },
        maxPodsConstraint: {
          maxPodsPerNode: GCP.DEFAULT_MAX_PODS_PER_NODE,
        },
      },
    });

    logger.info({ cluster: cluster.name }, 'Observability node pool created for BYOA GCP cluster.');
  } catch (error) {
    logger.error(
      {
        cluster: cluster.name,
        errorName: error?.name,
        errorMessage: error?.message,
        errorStack: error?.stack,
        errorDetails: error,
      },
      'Failed to create observability node pool for BYOA GCP cluster',
    );
  }
}

export async function createObservabilityNodePoolAWSBYOA(cluster: Cluster): Promise<void> {
  try {
    if (!cluster.awsAccountID) {
      logger.error({ cluster: cluster.name }, 'Missing awsAccountID for BYOA cluster');
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

    // List existing node groups
    const { cluster: awsCluster } = await eksClient.send(
      new DescribeClusterCommand({
        name: cluster.name,
      }),
    );

    const nodePools = awsCluster.computeConfig?.nodePools || [];

    if (nodePools.includes('observability')) {
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

        const currentInstanceTypes = nodegroup?.instanceTypes || [];
        if (!currentInstanceTypes.includes(AWS.DEFAULT_INSTANCE_TYPE)) {
          logger.warn(
            { cluster: cluster.name, current: currentInstanceTypes, desired: AWS.DEFAULT_INSTANCE_TYPE },
            'BYOA AWS observability node pool instance type mismatch - requires nodegroup recreation to change',
          );
        }

        if (updated) {
          logger.info({ cluster: cluster.name }, 'Observability node pool updated for BYOA AWS cluster.');
        } else {
          logger.info({ cluster: cluster.name }, 'Observability node pool already up to date for BYOA AWS cluster.');
        }
      } catch (describeError) {
        logger.warn({ cluster: cluster.name, error: describeError }, 'Could not describe/update existing BYOA AWS observability nodegroup');
      }
      return;
    }

    const subnetIds = awsCluster.resourcesVpcConfig.subnetIds;
    const nodeRole = awsCluster.computeConfig.nodeRoleArn;

    // Create the observability node group
    await eksClient.send(
      new CreateNodegroupCommand({
        clusterName: cluster.name,
        nodegroupName: 'observability',
        subnets: subnetIds,
        nodeRole: nodeRole,
        instanceTypes: [AWS.DEFAULT_INSTANCE_TYPE],
        diskSize: AWS.DEFAULT_DISK_SIZE_GB,
        scalingConfig: {
          minSize: AWS.DEFAULT_MIN_NODES,
          maxSize: AWS.DEFAULT_MAX_NODES,
          desiredSize: 1,
        },
        labels: {
          node_pool: 'observability',
        },
      }),
    );

    logger.info({ cluster: cluster.name }, 'Observability node pool created for BYOA AWS cluster.');
  } catch (error) {
    logger.error(
      {
        cluster: cluster.name,
        errorName: error?.name,
        errorMessage: error?.message,
        errorStack: error?.stack,
        errorDetails: error,
      },
      'Failed to create observability node pool for BYOA AWS cluster',
    );
  }
}

// AKS agent pool names must be 1-12 chars, lowercase alphanumeric.
const OBSERVABILITY_POOL_NAME = AZURE.OBSERVABILITY_POOL_NAME;
const SECURITY_POOL_NAME = AZURE.SECURITY_POOL_NAME;

export async function createObservabilityNodePoolAzureBYOA(cluster: Cluster): Promise<void> {
  try {
    if (!cluster.azureClientId || !cluster.azureTenantId || !cluster.azureResourceGroupName) {
      logger.error({ cluster: cluster.name }, 'Missing Azure credentials for BYOA Azure cluster');
      return;
    }

    const { credential } = await getAzureBYOACredentials(cluster).catch((error) => {
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

    const client = new ContainerServiceClient(credential, cluster.azureSubscriptionId);

    // Check if the observability agent pool already exists
    let existingPool = null;
    try {
      existingPool = await client.agentPools.get(cluster.azureResourceGroupName, cluster.name, OBSERVABILITY_POOL_NAME);
    } catch (error: any) {
      if (error.statusCode !== 404 && error.code !== 'ResourceNotFound' && error.code !== 'AgentPoolNotFound') {
        throw error;
      }
      // 404 / ResourceNotFound means the pool does not exist – proceed to create it
    }

    if (existingPool) {
      const needsScalingUpdate =
        existingPool.minCount !== AZURE.DEFAULT_MIN_NODES ||
        existingPool.maxCount !== AZURE.DEFAULT_MAX_NODES;

      if (existingPool.vmSize !== AZURE.DEFAULT_MACHINE_TYPE) {
        logger.warn(
          { cluster: cluster.name, current: existingPool.vmSize, desired: AZURE.DEFAULT_MACHINE_TYPE },
          'BYOA Azure observability node pool VM size mismatch - requires pool recreation to change',
        );
      }

      if (needsScalingUpdate) {
        await client.agentPools.beginCreateOrUpdateAndWait(cluster.azureResourceGroupName, cluster.name, OBSERVABILITY_POOL_NAME, {
          ...existingPool,
          enableAutoScaling: true,
          minCount: AZURE.DEFAULT_MIN_NODES,
          maxCount: AZURE.DEFAULT_MAX_NODES,
          nodeLabels: { node_pool: 'observability' },
        });
        logger.info({ cluster: cluster.name }, 'Observability node pool updated for BYOA Azure cluster.');
      } else {
        logger.info({ cluster: cluster.name }, 'Observability node pool already up to date for BYOA Azure cluster.');
      }
      return;
    }

    await client.agentPools.beginCreateOrUpdateAndWait(cluster.azureResourceGroupName, cluster.name, OBSERVABILITY_POOL_NAME, {
      count: 1,
      vmSize: AZURE.DEFAULT_MACHINE_TYPE,
      osDiskSizeGB: AZURE.DEFAULT_DISK_SIZE_GB,
      enableAutoScaling: true,
      minCount: AZURE.DEFAULT_MIN_NODES,
      maxCount: AZURE.DEFAULT_MAX_NODES,
      mode: 'User',
      nodeLabels: { node_pool: 'observability' },
      type: 'VirtualMachineScaleSets',
    });

    logger.info({ cluster: cluster.name }, 'Observability node pool created for BYOA Azure cluster.');
  } catch (error) {
    logger.error(
      {
        cluster: cluster.name,
        errorName: (error as any)?.name,
        errorMessage: (error as any)?.message,
        errorStack: (error as any)?.stack,
        errorDetails: error,
      },
      'Failed to create observability node pool for BYOA Azure cluster',
    );
  }
}

export async function createSecurityNodePoolGCPBYOA(cluster: Cluster): Promise<void> {
  try {
    if (!cluster.gcpAccountID || !cluster.gcpAccountNumber) {
      logger.error({ cluster: cluster.name }, 'Missing gcpAccountID or gcpAccountNumber for BYOA cluster');
      return;
    }

    const { authClient } = await getGCPBYOACredentials(cluster).catch((error) => {
      logger.error({ cluster: cluster.name, errorName: error?.name, errorMessage: error?.message }, 'Failed to get GCP BYOA credentials');
      throw error;
    });

    const client = new ClusterManagerClient({ authClient: authClient as any });
    const parent = `projects/${cluster.gcpAccountID}/locations/${cluster.region}/clusters/${cluster.name}`;

    const [nodePools] = await client.listNodePools({ parent });
    const existingPool = nodePools.nodePools?.find((np) => np.name === 'security');

    if (existingPool) {
      const poolName = `${parent}/nodePools/security`;
      let updated = false;

      if (existingPool.config?.machineType !== GCP.SECURITY_MACHINE_TYPE) {
        logger.info(
          { cluster: cluster.name, current: existingPool.config?.machineType, desired: GCP.SECURITY_MACHINE_TYPE },
          'Updating BYOA GCP security node pool machine type',
        );
        await client.updateNodePool({ name: poolName, machineType: GCP.SECURITY_MACHINE_TYPE });
        updated = true;
      }

      if (
        !existingPool.autoscaling?.enabled ||
        existingPool.autoscaling?.maxNodeCount !== GCP.SECURITY_MAX_NODES ||
        existingPool.autoscaling?.minNodeCount !== GCP.SECURITY_MIN_NODES
      ) {
        await client.setNodePoolAutoscaling({
          name: poolName,
          autoscaling: { enabled: true, maxNodeCount: GCP.SECURITY_MAX_NODES, minNodeCount: GCP.SECURITY_MIN_NODES },
        });
        updated = true;
      }

      if (updated) {
        logger.info({ cluster: cluster.name }, 'Security node pool updated for BYOA GCP cluster.');
      } else {
        logger.info({ cluster: cluster.name }, 'Security node pool already up to date for BYOA GCP cluster.');
      }
      return;
    }

    await client.createNodePool({
      parent,
      nodePool: {
        name: 'security',
        initialNodeCount: 0,
        config: {
          machineType: GCP.SECURITY_MACHINE_TYPE,
          diskSizeGb: GCP.DEFAULT_DISK_SIZE_GB,
          labels: { node_pool: 'security' },
        },
        autoscaling: {
          enabled: true,
          maxNodeCount: GCP.SECURITY_MAX_NODES,
          minNodeCount: GCP.SECURITY_MIN_NODES,
        },
        maxPodsConstraint: { maxPodsPerNode: GCP.DEFAULT_MAX_PODS_PER_NODE },
      },
    });

    logger.info({ cluster: cluster.name }, 'Security node pool created for BYOA GCP cluster.');
  } catch (error) {
    logger.error(
      { cluster: cluster.name, errorName: (error as any)?.name, errorMessage: (error as any)?.message, errorDetails: error },
      'Failed to create security node pool for BYOA GCP cluster',
    );
  }
}

export async function createSecurityNodePoolAWSBYOA(cluster: Cluster): Promise<void> {
  try {
    if (!cluster.awsAccountID) {
      logger.error({ cluster: cluster.name }, 'Missing awsAccountID for BYOA cluster');
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

    const { cluster: awsCluster } = await eksClient.send(
      new DescribeClusterCommand({ name: cluster.name }),
    );

    const nodePools = awsCluster.computeConfig?.nodePools || [];

    if (nodePools.includes('security')) {
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
            'BYOA AWS security node pool instance type mismatch - requires nodegroup recreation to change',
          );
        }

        if (updated) {
          logger.info({ cluster: cluster.name }, 'Security node pool updated for BYOA AWS cluster.');
        } else {
          logger.info({ cluster: cluster.name }, 'Security node pool already up to date for BYOA AWS cluster.');
        }
      } catch (describeError) {
        logger.warn({ cluster: cluster.name, error: describeError }, 'Could not describe/update existing BYOA AWS security nodegroup');
      }
      return;
    }

    const subnetIds = awsCluster.resourcesVpcConfig.subnetIds;
    const nodeRole = awsCluster.computeConfig.nodeRoleArn;

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
        labels: { node_pool: 'security' },
      }),
    );

    logger.info({ cluster: cluster.name }, 'Security node pool created for BYOA AWS cluster.');
  } catch (error) {
    logger.error(
      { cluster: cluster.name, errorName: (error as any)?.name, errorMessage: (error as any)?.message, errorDetails: error },
      'Failed to create security node pool for BYOA AWS cluster',
    );
  }
}

export async function createSecurityNodePoolAzureBYOA(cluster: Cluster): Promise<void> {
  try {
    if (!cluster.azureClientId || !cluster.azureTenantId || !cluster.azureResourceGroupName) {
      logger.error({ cluster: cluster.name }, 'Missing Azure credentials for BYOA Azure cluster');
      return;
    }

    const { credential } = await getAzureBYOACredentials(cluster).catch((error) => {
      logger.error({ cluster: cluster.name, errorName: error?.name, errorMessage: error?.message }, 'Failed to get Azure BYOA credentials');
      throw error;
    });

    const client = new ContainerServiceClient(credential, cluster.azureSubscriptionId);

    try {
      await client.agentPools.get(cluster.azureResourceGroupName, cluster.name, SECURITY_POOL_NAME);
    } catch (error: any) {
      if (error.statusCode !== 404 && error.code !== 'ResourceNotFound' && error.code !== 'AgentPoolNotFound') {
        throw error;
      }
      // 404 means doesn't exist - create below
      await client.agentPools.beginCreateOrUpdateAndWait(cluster.azureResourceGroupName, cluster.name, SECURITY_POOL_NAME, {
        count: 0,
        vmSize: AZURE.SECURITY_MACHINE_TYPE,
        osDiskSizeGB: AZURE.DEFAULT_DISK_SIZE_GB,
        enableAutoScaling: true,
        minCount: AZURE.SECURITY_MIN_NODES,
        maxCount: AZURE.SECURITY_MAX_NODES,
        mode: 'User',
        nodeLabels: { node_pool: 'security' },
        type: 'VirtualMachineScaleSets',
      });

      logger.info({ cluster: cluster.name }, 'Security node pool created for BYOA Azure cluster.');
      return;
    }

    // Pool exists - check if update is needed
    const existingSecPool = await client.agentPools.get(cluster.azureResourceGroupName, cluster.name, SECURITY_POOL_NAME);
    const needsScalingUpdate =
      existingSecPool.minCount !== AZURE.SECURITY_MIN_NODES ||
      existingSecPool.maxCount !== AZURE.SECURITY_MAX_NODES;

    if (existingSecPool.vmSize !== AZURE.SECURITY_MACHINE_TYPE) {
      logger.warn(
        { cluster: cluster.name, current: existingSecPool.vmSize, desired: AZURE.SECURITY_MACHINE_TYPE },
        'BYOA Azure security node pool VM size mismatch - requires pool recreation to change',
      );
    }

    if (needsScalingUpdate) {
      await client.agentPools.beginCreateOrUpdateAndWait(cluster.azureResourceGroupName, cluster.name, SECURITY_POOL_NAME, {
        ...existingSecPool,
        enableAutoScaling: true,
        minCount: AZURE.SECURITY_MIN_NODES,
        maxCount: AZURE.SECURITY_MAX_NODES,
        nodeLabels: { node_pool: 'security' },
      });
      logger.info({ cluster: cluster.name }, 'Security node pool updated for BYOA Azure cluster.');
    } else {
      logger.info({ cluster: cluster.name }, 'Security node pool already up to date for BYOA Azure cluster.');
    }
  } catch (error) {
    logger.error(
      { cluster: cluster.name, errorName: (error as any)?.name, errorMessage: (error as any)?.message, errorDetails: error },
      'Failed to create security node pool for BYOA Azure cluster',
    );
  }
}
