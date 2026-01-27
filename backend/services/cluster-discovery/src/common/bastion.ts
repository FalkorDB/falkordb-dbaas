import { DescribeClusterCommand, EKSClient } from '@aws-sdk/client-eks';
import { Cluster } from '../types';
import { getAWSCredentials } from './aws';

let bastionClusterCache: Cluster | null = null;

export async function getBastionCluster(): Promise<Cluster> {
  if (bastionClusterCache) {
    return bastionClusterCache;
  }

  const credentials = await getAWSCredentials();

  const client = new EKSClient({
    credentials,
    region: process.env.BASTION_CLUSTER_REGION || 'us-east-2',
  });

  const { cluster } = await client.send(
    new DescribeClusterCommand({
      name: process.env.BASTION_CLUSTER_NAME || '',
    }),
  );

  const bastionCluster: Cluster = {
    name: cluster.name!,
    region: process.env.BASTION_CLUSTER_REGION || 'us-east-2',
    cloud: 'aws',
    hostMode: 'managed',
    endpoint: cluster.endpoint!,
    labels: cluster.tags,
    secretConfig: {
      awsAuthConfig: {
        clusterName: cluster.name,
        roleARN: process.env.AWS_ROLE_ARN,
        profile: 'default',
      },
      tlsClientConfig: {
        insecure: false,
        caData: cluster.certificateAuthority.data,
      },
    },
  };

  bastionClusterCache = bastionCluster;

  return bastionCluster;
}
