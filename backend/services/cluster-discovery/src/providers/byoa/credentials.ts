import { Cluster } from '../../types';
import logger from '../../logger';
import * as k8s from '@kubernetes/client-node';
import { getK8sConfig } from '../../utils/k8s';
import { getBastionCluster } from '../../integrations/bastion';
import { GoogleAuth, OAuth2Client, Impersonated } from 'google-auth-library';
import type { TokenCredential, AccessToken, GetTokenOptions } from '@azure/core-auth';

export interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: string;
}

export interface GCPCredentials {
  token: string;
  authClient: any; // Custom auth client wrapper
}

export interface AzureCredentials {
  subscriptionId: string;
  credential: TokenCredential;
}

/**
 * Executes a command in a pod within the bastion cluster
 * @param command - Command array to execute
 * @returns Command stdout output
 */
export async function executePodCommandInBastion(command: string[]): Promise<string> {
  // Connect to bastion cluster - it's a managed AWS EKS cluster
  const bastionCluster: Cluster = await getBastionCluster();

  const kc = await getK8sConfig(bastionCluster);
  const namespace = process.env.BASTION_NAMESPACE || 'bootstrap';
  const podLabelSelector = process.env.BASTION_POD_LABEL || 'app.kubernetes.io/instance=bootstrap-dataplane-worker';
  const containerName = process.env.BASTION_CONTAINER_NAME || 'bootstrap-dataplane-worker';

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

  // Execute command in pod - use PassThrough streams to properly capture output
  let stdout = '';
  let stderr = '';

  const { PassThrough } = require('stream');

  const stdoutStream = new PassThrough();
  stdoutStream.on('data', (chunk) => {
    stdout += chunk.toString();
  });

  const stderrStream = new PassThrough();
  stderrStream.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await exec.exec(
      namespace,
      podName,
      containerName,
      command,
      stdoutStream,
      stderrStream,
      null, // stdin
      false, // tty
    );

    // Wait for streams to finish
    await new Promise((resolve) => {
      let stdoutEnded = false;
      let stderrEnded = false;

      const checkBothEnded = () => {
        if (stdoutEnded && stderrEnded) resolve(undefined);
      };

      stdoutStream.on('end', () => {
        stdoutEnded = true;
        checkBothEnded();
      });

      stderrStream.on('end', () => {
        stderrEnded = true;
        checkBothEnded();
      });

      // Timeout after 5 seconds
      setTimeout(() => resolve(undefined), 5000);
    });
  } catch (error) {
    logger.error(
      {
        podName,
        namespace,
        containerName,
        command,
        stdout,
        stderr,
        errorName: error?.name,
        errorMessage: error?.message,
        errorStack: error?.stack,
        errorCode: error?.code,
        errorBody: error?.body,
        errorResponse: error?.response,
        errorStatusCode: error?.statusCode,
        errorReason: error?.reason,
        errorDetails: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      },
      'Failed to execute command in pod',
    );
    throw error;
  }

  if (stderr) {
    logger.warn({ stderr, podName, command }, 'Command produced stderr output');
  }

  return stdout;
}

/**
 * Retrieves AWS credentials for BYOA cluster using STS assume-role
 * @param cluster - Target cluster
 * @returns AWS credentials
 */
export async function getAWSBYOACredentials(cluster: Cluster): Promise<AWSCredentials> {
  const roleArn = `arn:aws:iam::${cluster.destinationAccountID}:role/omnistrate-bootstrap-role`;
  const roleSessionName = `bootstrap-session-org-${cluster.destinationAccountID}`;

  const command = [
    'sh',
    '-c',
    `aws sts assume-role-with-web-identity \
      --role-arn ${roleArn} \
      --role-session-name ${roleSessionName} \
      --web-identity-token file://\$AWS_WEB_IDENTITY_TOKEN_FILE`,
  ];

  const output = await executePodCommandInBastion(command);

  const result = JSON.parse(output.trim());

  return {
    accessKeyId: result.Credentials.AccessKeyId,
    secretAccessKey: result.Credentials.SecretAccessKey,
    sessionToken: result.Credentials.SessionToken,
    expiration: result.Credentials.Expiration,
  };
}

/**
 * Retrieves GCP credentials for BYOA cluster using Workload Identity Federation
 * @param cluster - Target cluster
 * @returns GCP credentials with impersonated access token
 */
export async function getGCPBYOACredentials(cluster: Cluster): Promise<GCPCredentials> {
  const gcpProjectNumber = cluster.destinationAccountNumber; // GCP project number
  const audience = `//iam.googleapis.com/projects/${gcpProjectNumber}/locations/global/workloadIdentityPools/omnistrate-bootstrap-id-pool/providers/omnistrate-oidc-prov`;

  // Exchange AWS EKS service account token for GCP access token using Workload Identity Federation
  const command = [
    'sh',
    '-c',
    `
TMP_CRED="/tmp/cred_$(head -c 8 /dev/urandom | base64 | tr -dc a-z0-9).json"
printf '{
  "type": "external_account",
  "audience": "${audience}",
  "subject_token_type": "urn:ietf:params:oauth:token-type:jwt",
  "token_url": "https://sts.googleapis.com/v1/token",
  "credential_source": {"file": "/var/run/secrets/eks.amazonaws.com/serviceaccount/token"}
}' > "$TMP_CRED"

export GOOGLE_APPLICATION_CREDENTIALS="$TMP_CRED"
gcloud auth application-default print-access-token 2>&1
`,
  ];

  const output = await executePodCommandInBastion(command).catch((error) => {
    logger.error(
      {
        cluster: cluster.name,
        errorName: error?.name,
        errorMessage: error?.message,
        errorStack: error?.stack,
        errorCode: error?.code,
        errorResponse: error?.response,
        errorDetails: error,
      },
      'Failed to exchange AWS token for GCP access token',
    );
    throw error;
  });

  const token = output.trim();

  if (!token || token === '') {
    logger.error({ cluster: cluster.name, output }, 'Empty response from GCP STS token exchange');
    throw new Error('Empty response from GCP STS token exchange');
  }

  if (!token.startsWith('ya29.')) {
    logger.error(
      { cluster: cluster.name, output: token.substring(0, 200) },
      'Invalid GCP access token format received',
    );
    throw new Error('Invalid GCP access token format received');
  }

  // Create OAuth2Client with the access token
  const oauthClient = new OAuth2Client();
  oauthClient.setCredentials({ access_token: token });

  const serviceAccountEmail = cluster.gcpServiceAccountEmail;

  const impersonatedClient = new Impersonated({
    sourceClient: oauthClient,
    targetPrincipal: serviceAccountEmail,
    targetScopes: ['https://www.googleapis.com/auth/cloud-platform'],
    lifetime: 3600,
  });

  const { token: impersonatedToken } = await impersonatedClient.getAccessToken();

  // Create a custom auth client wrapper that properly implements getRequestHeaders
  // This fixes the gRPC "headers.forEach is not a function" error that occurs when
  // using impersonated credentials with google-auth-library and gRPC clients.
  // The issue is that some versions return headers in incompatible formats.
  // See: https://github.com/googleapis/google-auth-library-nodejs/issues/1960
  const wrappedAuthClient = {
    async getRequestHeaders(url?: string) {
      // Create a plain object with headers
      const headers: any = {
        Authorization: `Bearer ${impersonatedToken.trim()}`,
      };

      // Add forEach method as a non-enumerable property so it won't be
      // included when gRPC iterates over the headers object
      Object.defineProperty(headers, 'forEach', {
        value: function (callback: (value: string, key: string) => void) {
          Object.entries(headers).forEach(([key, value]) => {
            if (key !== 'forEach') {
              callback(value as string, key);
            }
          });
        },
        enumerable: false, // Critical: prevents forEach from being enumerated as a header
        writable: false,
        configurable: false,
      });

      return headers;
    },
    async getAccessToken() {
      return { token: impersonatedToken.trim() };
    },
  };

  return {
    token: impersonatedToken.trim(),
    authClient: wrappedAuthClient as any,
  };
}

/**
 * Retrieves Azure credentials for a BYOA cluster using Azure Workload Identity
 * in the bastion cluster. Exchanges the workload identity token for an access token
 * scoped to the customer's Azure subscription.
 * @param cluster - Target cluster (destinationAccountID = customer subscription ID)
 * @returns Azure credentials for the customer's subscription
 */
export async function getAzureBYOACredentials(cluster: Cluster): Promise<AzureCredentials> {
  const subscriptionId = cluster.destinationAccountID;

  // Get an access token by exchanging the federated token with Azure AD directly.
  // The bastion pod uses Azure Workload Identity and exposes AZURE_FEDERATED_TOKEN_FILE.
  const command = [
    'sh',
    '-c',
    `FEDERATED_TOKEN=$(cat $AZURE_FEDERATED_TOKEN_FILE)
  curl -X POST https://login.microsoftonline.com/${cluster.azureTenantId}/oauth2/v2.0/token \
  -d "grant_type=client_credentials" \
  -d "client_id=${cluster.azureClientId}" \
  -d "client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer" \
  -d "client_assertion=$FEDERATED_TOKEN" \
  -d "scope=https://management.azure.com/.default"`,
  ];

  const output = await executePodCommandInBastion(command).catch((error) => {
    logger.error(
      {
        cluster: cluster.name,
        subscriptionId,
        errorName: error?.name,
        errorMessage: error?.message,
        errorStack: error?.stack,
        errorDetails: error,
      },
      'Failed to get Azure access token from bastion for BYOA cluster',
    );
    throw error;
  });

  let tokenResponse: {
    access_token?: string;
    expires_in?: number | string;
    error?: string;
    error_description?: string;
  };

  try {
    tokenResponse = JSON.parse(output.trim());
  } catch (error) {
    throw new Error(`Invalid Azure token response received: ${output.trim().slice(0, 300)}`);
  }

  if (tokenResponse.error) {
    throw new Error(
      `Azure token exchange failed: ${tokenResponse.error}${
        tokenResponse.error_description ? ` - ${tokenResponse.error_description}` : ''
      }`,
    );
  }

  const accessToken = tokenResponse.access_token?.trim();

  if (!accessToken) {
    throw new Error(`Empty Azure access token received for subscription '${subscriptionId}'`);
  }

  // Parse expiry from OAuth response (seconds), falling back to 1 hour.
  const expiresInSeconds = Number(tokenResponse.expires_in);
  const expiresOnTimestamp =
    Number.isFinite(expiresInSeconds) && expiresInSeconds > 0
      ? Date.now() + expiresInSeconds * 1000
      : Date.now() + 3600 * 1000;

  // Wrap the static token in a TokenCredential compatible with the Azure SDK.
  const credential: TokenCredential = {
    getToken: async (_scopes: string | string[], _options?: GetTokenOptions): Promise<AccessToken> => ({
      token: accessToken,
      expiresOnTimestamp,
    }),
  };

  return { subscriptionId, credential };
}
