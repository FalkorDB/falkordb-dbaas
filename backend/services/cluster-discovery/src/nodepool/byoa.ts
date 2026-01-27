import { Cluster } from '../types';
import logger from '../logger';
import { EKSClient, DescribeClusterCommand, CreateNodegroupCommand } from '@aws-sdk/client-eks';
import { ClusterManagerClient } from '@google-cloud/container';
import * as k8s from '@kubernetes/client-node';
import { getK8sConfig } from '../common/k8s';
import { getBastionCluster } from '../common/bastion';
import { GoogleAuth, Impersonated, OAuth2Client } from 'google-auth-library';

interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: string;
}

interface GCPCredentials {
  token: string;
}

async function executePodCommandInBastion(command: string[]): Promise<string> {
  // Connect to bastion cluster - it's a managed AWS EKS cluster
  const bastionCluster: Cluster = await getBastionCluster();

  const kc = await getK8sConfig(bastionCluster);
  const namespace = process.env.BASTION_NAMESPACE || 'bootstrap';
  const podLabelSelector = process.env.BASTION_POD_LABEL || 'app.kubernetes.io/instance=bootstrap-dataplane-worker';

  const coreApi = kc.makeApiClient(k8s.CoreV1Api);
  const exec = new k8s.Exec(kc);

  // Find a pod with the specified label selector
  const podList = await coreApi.listNamespacedPod(
    namespace,
    undefined,
    undefined,
    undefined,
    undefined,
    podLabelSelector,
  );

  if (!podList.body.items || podList.body.items.length === 0) {
    throw new Error(`No pods found with label selector: ${podLabelSelector}`);
  }

  const pod = podList.body.items[0];
  const podName = pod.metadata.name;

  logger.info({ podName, namespace, command }, 'Executing command in pod');

  // Execute command in pod
  let stdout = '';
  let stderr = '';

  await exec.exec(
    namespace,
    podName,
    pod.spec.containers[0].name,
    command,
    null, // Don't pipe to process.stdout
    null, // Don't pipe to process.stderr
    null, // Don't pipe stdin
    false,
    async ({ status, data }: { status: string; data: string }) => {
      if (status === 'stdout') {
        stdout += data;
      } else if (status === 'stderr') {
        stderr += data;
      }
    },
  );

  if (stderr) {
    logger.warn({ stderr, podName, command }, 'Command produced stderr output');
  }

  logger.info({ stdout, stderr, podName }, 'Command executed successfully');

  return stdout;
}

async function getAWSBYOACredentials(cluster: Cluster): Promise<AWSCredentials> {
  const roleArn = `arn:aws:iam::${cluster.destinationAccountID}:role/omnistrate-bootstrap-role`;
  const roleSessionName = `bootstrap-session-org-${cluster.destinationAccountID}`;

  const command = [
    'aws',
    'sts',
    'assume-role-with-web-identity',
    '--role-arn',
    roleArn,
    '--role-session-name',
    roleSessionName,
    '--web-identity-token',
    'file://$AWS_WEB_IDENTITY_TOKEN_FILE',
  ];

  const output = await executePodCommandInBastion(command);

  const result = JSON.parse(output);

  return {
    accessKeyId: result.Credentials.AccessKeyId,
    secretAccessKey: result.Credentials.SecretAccessKey,
    sessionToken: result.Credentials.SessionToken,
    expiration: result.Credentials.Expiration,
  };
}

async function getGCPBYOACredentials(cluster: Cluster): Promise<GCPCredentials> {
  const gcpProjectNumber = cluster.destinationAccountNumber; // GCP project number

  // Exchange AWS EKS service account token for GCP access token using Workload Identity Federation
  const command = [
    'sh',
    '-c',
    `TOKEN=$(cat $AWS_WEB_IDENTITY_TOKEN_FILE) && curl -X POST https://sts.googleapis.com/v1/token \\
      -H "Content-Type: application/json" \\
      -d "{
        \"audience\": \"//iam.googleapis.com/projects/${gcpProjectNumber}/locations/global/workloadIdentityPools/omnistrate-bootstrap-id-pool/providers/omnistrate-oidc-prov\",
        \"grantType\": \"urn:ietf:params:oauth:grant-type:token-exchange\",
        \"requestedTokenType\": \"urn:ietf:params:oauth:token-type:access_token\",
        \"subjectTokenType\": \"urn:ietf:params:oauth:token-type:jwt\",
        \"scope\": \"https://www.googleapis.com/auth/cloud-platform\",
        \"subjectToken\": \"$TOKEN\"
      }" || echo "CURL_FAILED_$?"`,
  ];

  const output = await executePodCommandInBastion(command).catch((error) => {
    logger.error(
      { cluster: cluster.name, error, errorName: error.name, errorMessage: error.message },
      'Failed to exchange AWS token for GCP access token',
    );
    throw error;
  });

  if (!output || output.trim() === '') {
    logger.error({ cluster: cluster.name, output }, 'Empty response from GCP STS token exchange');
    throw new Error('Empty response from GCP STS token exchange');
  }

  if (output.startsWith('CURL_FAILED_')) {
    logger.error({ cluster: cluster.name, output }, 'Curl command failed in pod');
    throw new Error(`Curl command failed: ${output}`);
  }

  let result: { access_token: string; token_type: string; expires_in: number };
  try {
    result = JSON.parse(output);
  } catch (error) {
    logger.error(
        { cluster: cluster.name, output, error, errorName: error.name, errorMessage: error.message },
        'Failed to parse GCP STS token exchange response',
        );
        throw error;
  }

  const stsCredentials = {
    accessToken: result.access_token,
    tokenType: result.token_type,
    expiresIn: result.expires_in,
  };

  const baseAuth = new GoogleAuth({
    credentials: {
      access_token: stsCredentials.accessToken,
    } as any,
  });

  const serviceAccountEmail = `bootstrap-${cluster.organizationId}@${cluster.destinationAccountNumber}.iam.gserviceaccount.com`;

  const impersonatedClient = new Impersonated({
    sourceClient: await baseAuth.getClient(),
    targetPrincipal: serviceAccountEmail,
    targetScopes: ['https://www.googleapis.com/auth/cloud-platform'],
    lifetime: 3600,
  });

  const { token } = await impersonatedClient.getAccessToken();

  return { token };
}

export async function createObservabilityNodePoolGCPBYOA(cluster: Cluster): Promise<void> {
  try {
    if (!cluster.destinationAccountID || !cluster.destinationAccountNumber) {
      logger.error(
        { cluster: cluster.name },
        'Missing destinationAccountID or destinationAccountNumber for BYOA cluster',
      );
      return;
    }

    const { token } = await getGCPBYOACredentials(cluster).catch((error) => {
      logger.error(
        { cluster: cluster.name, error, errorName: error.name, errorMessage: error.message },
        'Failed to get GCP BYOA credentials',
      );
      throw error;
    });

    const oauthClient = new OAuth2Client();
    oauthClient.setCredentials({ access_token: token });

    // Create GCP client with workload identity credentials
    const client = new ClusterManagerClient({
      authClient: oauthClient as any,
    });

    const [nodePools] = await client
      .listNodePools({
        parent: `projects/${cluster.destinationAccountID}/locations/${cluster.region}/clusters/${cluster.name}`,
      })
      .catch((error) => {
        logger.error(
          { cluster: cluster.name, error, errorName: error.name, errorMessage: error.message },
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
      { cluster: cluster.name, error, errorName: error.name, errorMessage: error.message },
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
      { cluster: cluster.name, error, errorName: error.name, errorMessage: error.message },
      'Failed to create observability node pool for BYOA AWS cluster',
    );
  }
}
