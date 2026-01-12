import * as k8s from '@kubernetes/client-node';
import { DescribeClusterCommand, EKSClient } from '@aws-sdk/client-eks';
import { STSClient, AssumeRoleWithWebIdentityCommand } from '@aws-sdk/client-sts';
import { v1 as googleContainerV1 } from '@google-cloud/container';
import axios from 'axios';
import assert from 'assert';
import { FastifyBaseLogger } from 'fastify';
import { IK8sRepository } from './IK8sRepository';
import net from 'net';

export class K8sRepository implements IK8sRepository {
  constructor(private _options: { logger: FastifyBaseLogger }) {}

  private async _getGKECredentials(clusterId: string, region: string) {
    const client = new googleContainerV1.ClusterManagerClient();

    const projectId = process.env.APPLICATION_PLANE_GOOGLE_CLOUD_PROJECT;
    assert(projectId, 'Env var APPLICATION_PLANE_GOOGLE_CLOUD_PROJECT is required');
    const accessToken = await client.auth.getAccessToken();

    const [response] = await client.getCluster({
      name: `projects/${projectId}/locations/${region}/clusters/${clusterId}`,
    });

    assert(response.endpoint, `Cluster ${clusterId} endpoint not found`);
    assert(response.masterAuth?.clusterCaCertificate, `Cluster ${clusterId} CA certificate not found`);

    return {
      endpoint: `https://${response.endpoint}`,
      certificateAuthority: response.masterAuth.clusterCaCertificate,
      accessToken: accessToken,
    };
  }

  private async _getAWSCredentials() {
    const targetAudience = process.env.AWS_TARGET_AUDIENCE;
    assert(targetAudience, 'Env var AWS_TARGET_AUDIENCE is required');

    const res = await axios.get(
      'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=' +
        targetAudience,
      {
        headers: {
          'Metadata-Flavor': 'Google',
        },
        timeout: 10000,
      },
    );

    const idToken = res.data;

    const roleArn = process.env.AWS_ROLE_ARN;
    assert(roleArn, 'Env var AWS_ROLE_ARN is required');

    const sts = new STSClient({ region: 'us-west-2' });

    const { Credentials } = await sts.send(
      new AssumeRoleWithWebIdentityCommand({
        RoleArn: roleArn,
        RoleSessionName: process.env.SERVICE_NAME || 'customer-ldap',
        WebIdentityToken: idToken,
      }),
    );

    assert(Credentials?.AccessKeyId, 'STS response missing AccessKeyId');
    assert(Credentials?.SecretAccessKey, 'STS response missing SecretAccessKey');
    assert(Credentials?.SessionToken, 'STS response missing SessionToken');

    return {
      accessKeyId: Credentials.AccessKeyId,
      secretAccessKey: Credentials.SecretAccessKey,
      sessionToken: Credentials.SessionToken,
    };
  }

  private async _getEKSCredentials(clusterId: string, region: string) {
    const { accessKeyId, secretAccessKey, sessionToken } = await this._getAWSCredentials();

    const eks = new EKSClient({
      credentials: {
        accessKeyId,
        secretAccessKey,
        sessionToken,
      },
      region,
    });

    const { cluster } = await eks.send(new DescribeClusterCommand({ name: clusterId }));

    // Generate EKS token directly using presigned STS URL approach
    // This avoids mutating global state in aws-eks-token module
    const token = await this._generateEKSToken(clusterId, region, {
      accessKeyId,
      secretAccessKey,
      sessionToken,
    });

    assert(cluster, `EKS cluster '${clusterId}' not found`);
    assert(cluster.endpoint, 'EKS cluster response missing endpoint');
    assert(cluster.certificateAuthority?.data, 'EKS cluster response missing CA data');

    return {
      endpoint: cluster.endpoint,
      certificateAuthority: cluster.certificateAuthority.data,
      accessToken: token,
    };
  }

  private async _generateEKSToken(
    clusterName: string,
    region: string,
    credentials: { accessKeyId: string; secretAccessKey: string; sessionToken: string },
  ): Promise<string> {
    // Generate a presigned STS GetCallerIdentity URL for EKS authentication
    // This is the standard EKS authentication mechanism
    const { GetCallerIdentityCommand } = await import('@aws-sdk/client-sts');
    const { SignatureV4 } = await import('@aws-sdk/signature-v4');
    const { Sha256 } = await import('@aws-crypto/sha256-js');
    const { HttpRequest } = await import('@aws-sdk/protocol-http');

    const endpoint = `https://sts.${region}.amazonaws.com/`;
    const request = new HttpRequest({
      method: 'GET',
      protocol: 'https:',
      hostname: `sts.${region}.amazonaws.com`,
      path: '/',
      query: {
        Action: 'GetCallerIdentity',
        Version: '2011-06-15',
      },
      headers: {
        host: `sts.${region}.amazonaws.com`,
        'x-k8s-aws-id': clusterName,
      },
    });

    const signer = new SignatureV4({
      credentials: credentials,
      region: region,
      service: 'sts',
      sha256: Sha256,
    });

    const signedRequest = await signer.sign(request);

    // Build the presigned URL
    const url = new URL(endpoint);
    url.searchParams.set('Action', 'GetCallerIdentity');
    url.searchParams.set('Version', '2011-06-15');

    // Add signature parameters
    for (const [key, value] of Object.entries(signedRequest.query || {})) {
      url.searchParams.set(key, value as string);
    }

    // Add signature headers as query params
    if (signedRequest.headers['x-amz-security-token']) {
      url.searchParams.set('X-Amz-Security-Token', signedRequest.headers['x-amz-security-token'] as string);
    }
    if (signedRequest.headers['x-amz-date']) {
      url.searchParams.set('X-Amz-Date', signedRequest.headers['x-amz-date'] as string);
    }
    if (signedRequest.headers['authorization']) {
      const auth = signedRequest.headers['authorization'] as string;
      const credentialMatch = auth.match(/Credential=([^,]+)/);
      const signedHeadersMatch = auth.match(/SignedHeaders=([^,]+)/);
      const signatureMatch = auth.match(/Signature=(.+)$/);

      if (credentialMatch) url.searchParams.set('X-Amz-Credential', credentialMatch[1]);
      if (signedHeadersMatch) url.searchParams.set('X-Amz-SignedHeaders', signedHeadersMatch[1]);
      if (signatureMatch) url.searchParams.set('X-Amz-Signature', signatureMatch[1]);
    }

    // EKS expects the token in the format: k8s-aws-v1.<base64-encoded-url>
    const encodedUrl = Buffer.from(url.toString()).toString('base64').replace(/=+$/, '');
    return `k8s-aws-v1.${encodedUrl}`;
  }

  async getK8sConfig(
    cloudProvider: 'gcp' | 'aws' | 'azure',
    clusterId: string,
    region: string,
  ): Promise<k8s.KubeConfig> {
    this._options.logger.info({ cloudProvider, clusterId, region }, 'Getting K8s config');

    const k8sCredentials =
      cloudProvider === 'gcp'
        ? await this._getGKECredentials(clusterId, region)
        : await this._getEKSCredentials(clusterId, region);

    const kubeConfig = new k8s.KubeConfig();
    kubeConfig.loadFromOptions({
      clusters: [
        {
          name: clusterId,
          caData: k8sCredentials.certificateAuthority,
          server: k8sCredentials.endpoint,
        },
      ],
      users: [
        {
          name: clusterId,
          authProvider: cloudProvider === 'gcp' ? cloudProvider : undefined,
          token: k8sCredentials.accessToken,
        },
      ],
      contexts: [
        {
          name: clusterId,
          user: clusterId,
          cluster: clusterId,
        },
      ],
      currentContext: clusterId,
    });

    kubeConfig.applyToRequest = async (opts) => {
      opts.ca = Buffer.from(k8sCredentials.certificateAuthority, 'base64');
      opts.headers = opts.headers || {};
      opts.headers.Authorization = 'Bearer ' + k8sCredentials.accessToken;
    };

    return kubeConfig;
  }

  async createPortForward(
    kubeConfig: k8s.KubeConfig,
    namespace: string,
    podName: string,
    port: number,
  ): Promise<{ localPort: number; close: () => void }> {
    this._options.logger.info({ namespace, podName, port }, 'Creating port forward');

    const forward = new k8s.PortForward(kubeConfig);

    // Find an available local port
    const localPort = await this._findAvailablePort();

    const server = net.createServer(async (socket) => {
      try {
        await forward.portForward(namespace, podName, [port], socket, null, socket);
      } catch (err) {
        this._options.logger.error({ err, namespace, podName, port }, 'Port forward connection error');
        socket.destroy();
      }
    });

    await new Promise<void>((resolve, reject) => {
      server.listen(localPort, 'localhost', () => {
        this._options.logger.info({ localPort, namespace, podName, port }, 'Port forward established');
        resolve();
      });

      server.on('error', (err) => {
        this._options.logger.error({ err }, 'Error establishing port forward');
        reject(err);
      });
    });

    return {
      localPort,
      close: () => {
        this._options.logger.info({ localPort }, 'Closing port forward');
        server.close();
      },
    };
  }

  private async _findAvailablePort(): Promise<number> {
    return new Promise((resolve, reject) => {
      const server = net.createServer();
      server.unref();
      server.on('error', reject);
      server.listen(0, () => {
        const { port } = server.address() as net.AddressInfo;
        server.close(() => {
          resolve(port);
        });
      });
    });
  }
}
