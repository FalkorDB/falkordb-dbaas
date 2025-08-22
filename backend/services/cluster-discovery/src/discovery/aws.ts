import { ClusterSchema, Cluster } from '../types';
import logger from '../logger';
import { AccountClient, ListRegionsCommand } from "@aws-sdk/client-account";
import { STSClient, AssumeRoleWithWebIdentityCommand } from '@aws-sdk/client-sts';
import { EKSClient, DescribeClusterCommand, ListClustersCommand, ListAccessEntriesCommand, CreateAccessEntryCommand, AssociateAccessPolicyCommand, AccessScopeType, CreateAccessEntryCommandOutput, DescribeAccessEntryCommand } from '@aws-sdk/client-eks';
import axios from 'axios';

type AWSCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
}

export async function discoverAWSClusters(): Promise<{ clusters: Cluster[], credentials: AWSCredentials }> {
  logger.info('Discovering AWS clusters...');

  const credentials = await getAWSCredentials();

  const regions = await getAWSRegions(credentials);

  const clusters: Cluster[] = [];

  for await (const region of regions) {
    clusters.push(
      ...(await getRegionClusters(credentials, region))
    )
  }

  const validClusters = clusters.filter((c): c is Cluster => c !== null);

  logger.info({ clusterCount: validClusters.length }, `Found ${validClusters.length} AWS clusters.`);

  // Validate clusters
  return { clusters: validClusters.map((cluster) => ClusterSchema.validateSync(cluster)), credentials }
}

async function getAWSCredentials(): Promise<AWSCredentials> {
  const targetAudience = process.env.AWS_TARGET_AUDIENCE;

  const res = await axios.get(
    'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=' +
    targetAudience,
    {
      headers: {
        'Metadata-Flavor': 'Google',
      },
    },
  );

  const idToken = res.data;

  const sts = new STSClient({});

  const { Credentials } = await sts.send(
    new AssumeRoleWithWebIdentityCommand({
      RoleArn: process.env.AWS_ROLE_ARN,
      RoleSessionName: process.env.SERVICE_NAME || 'cluster-discovery',
      WebIdentityToken: idToken,
    }),
  );

  return {
    accessKeyId: Credentials.AccessKeyId,
    secretAccessKey: Credentials.SecretAccessKey,
    sessionToken: Credentials.SessionToken,
  };
}

async function getAWSRegions(credentials: AWSCredentials) {
  const client = new AccountClient({
    credentials,
    region: 'us-west-2',
  });

  try {
    const command = new ListRegionsCommand({
      RegionOptStatusContains: ['ENABLED', 'ENABLED_BY_DEFAULT'],
      MaxResults: 50,
    });
    const response = await client.send(command);

    return response.Regions.map(r => r.RegionName)
  } catch (error) {
    logger.error(error, 'Failed to get AWS regions')
    return [];
  }
}

async function getRegionClusters(credentials: AWSCredentials, region: string): Promise<Cluster[]> {
  const client = new EKSClient({
    credentials,
    region,
  })

  try {
    const { clusters: clusterNames } = await client.send(new ListClustersCommand());

    logger.info(`Found ${clusterNames.length} clusters in aws region ${region}`)

    const clusters: Cluster[] = [];
    for await (const clusterName of clusterNames) {

      const { cluster } = await client.send(new DescribeClusterCommand({
        name: clusterName,
      }))

      clusters.push({
        name: clusterName,
        region,
        cloud: 'aws',
        endpoint: cluster.endpoint,
        labels: cluster.tags,
        caData: cluster.certificateAuthority.data,
      })

      await resolveClusterAccessEntry(client, cluster);
    }

    return clusters;
  } catch (error) {
    logger.error(error, 'Failed to get clusters from region ' + region)
    return [];
  }
}

async function resolveClusterAccessEntry(client: EKSClient, cluster: Cluster): Promise<void> {

  let hasAccessEntries = false;
  try {
    const accessEntries = await client.send(new ListAccessEntriesCommand({
      clusterName: cluster.name,
      associatedPolicyArn: 'arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy',
    }))
    hasAccessEntries = accessEntries.accessEntries.length > 0 && (
      await Promise.all(
        accessEntries.accessEntries.map(a =>
          client.send(new DescribeAccessEntryCommand({
            clusterName: cluster.name,
            principalArn: a,
          })).then(e => e.accessEntry.principalArn === process.env.AWS_ROLE_ARN)
        )
      )
    ).some(a => !!a)
  } catch (error) {
    logger.error(error, "Failed to get access entries for cluster " + cluster.name)
    return;
  }

  if (!hasAccessEntries) {
    let accessEntry: CreateAccessEntryCommandOutput;
    try {
      accessEntry = await client.send(new CreateAccessEntryCommand({
        clusterName: cluster.name,
        principalArn: process.env.AWS_ROLE_ARN,
        type: 'STANDARD',
      }))
    } catch (error) {
      logger.error(error, "Failed to create access entries for cluster " + cluster.name)
      return;
    }

    try {
      await client.send(new AssociateAccessPolicyCommand({
        clusterName: cluster.name,
        accessScope: { type: AccessScopeType.cluster, },
        policyArn: 'arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy',
        principalArn: accessEntry.accessEntry.principalArn,
      }))
    } catch (error) {
      logger.error(error, "Failed to create access policy for cluster " + cluster.name)
      return;
    }
  }
}