import { Cluster } from '../../types';
import logger from '../../logger';
import { EKSClient, DescribeClusterCommand, CreateNodegroupCommand } from '@aws-sdk/client-eks';
import { ClusterManagerClient } from '@google-cloud/container';
import { getAWSBYOACredentials, getGCPBYOACredentials } from './credentials';

export async function createObservabilityNodePoolGCPBYOA(cluster: Cluster): Promise<void> {
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

    if (exists) {
      logger.info({ cluster: cluster.name }, 'Observability node pool already exists.');
      return;
    }

    await client.createNodePool({
      parent: `projects/${cluster.destinationAccountID}/locations/${cluster.region}/clusters/${cluster.name}`,
      nodePool: {
        name: 'observability',
        initialNodeCount: 1,
        config: {
          machineType: 'e2-standard-2',
          diskSizeGb: 50,
          labels: { node_pool: 'observability' },
        },
        autoscaling: {
          enabled: true,
          maxNodeCount: 10,
          minNodeCount: 1,
        },
        maxPodsConstraint: {
          maxPodsPerNode: 25,
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

    // List existing node groups
    const { cluster: awsCluster } = await eksClient.send(
      new DescribeClusterCommand({
        name: cluster.name,
      }),
    );

    const nodePools = awsCluster.computeConfig?.nodePools || [];

    if (nodePools.includes('observability')) {
      logger.info({ cluster: cluster.name }, 'Observability node pool already exists.');
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
        instanceTypes: ['m5.large'],
        diskSize: 50,
        scalingConfig: {
          minSize: 1,
          maxSize: 10,
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
