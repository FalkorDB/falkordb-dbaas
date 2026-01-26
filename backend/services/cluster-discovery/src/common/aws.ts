import { DescribeClusterCommand, EKSClient } from '@aws-sdk/client-eks';
import { STSClient, AssumeRoleWithWebIdentityCommand } from '@aws-sdk/client-sts';
import axios from 'axios';
import { Cluster } from '../types';

export type AWSCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
};

export async function getAWSCredentials(): Promise<AWSCredentials> {
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

  const sts = new STSClient({ region: 'us-west-2' });

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

export async function getEKSCredentials(cluster: Cluster) {
  const { accessKeyId, secretAccessKey, sessionToken } = await getAWSCredentials();

  const eks = new EKSClient({
    credentials: {
      accessKeyId,
      secretAccessKey,
      sessionToken,
    },
    region: cluster.region,
  });

  const { cluster: eksCluster } = await eks.send(new DescribeClusterCommand({ name: cluster.name }));

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const EKSToken = require('aws-eks-token');
  EKSToken.config = {
    accessKeyId,
    secretAccessKey,
    sessionToken,
    region: cluster.region,
  };

  const token = await EKSToken.renew(cluster.name);

  return {
    endpoint: eksCluster.endpoint,
    certificateAuthority: eksCluster.certificateAuthority.data,
    accessToken: token,
  };
}
