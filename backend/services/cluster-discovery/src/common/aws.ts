import { STSClient, AssumeRoleWithWebIdentityCommand } from '@aws-sdk/client-sts';
import axios from 'axios';

export type AWSCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
}


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
