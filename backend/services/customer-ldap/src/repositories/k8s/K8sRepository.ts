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

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const EKSToken = require('aws-eks-token');
    EKSToken.config = {
      accessKeyId,
      secretAccessKey,
      sessionToken,
      region,
    };

    const token = await EKSToken.renew(clusterId);

    return {
      endpoint: cluster.endpoint,
      certificateAuthority: cluster.certificateAuthority.data,
      accessToken: token,
    };
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

    const server = net.createServer((socket) => {
      forward.portForward(namespace, podName, [port], socket, null, socket);
    });

    await new Promise<void>((resolve, reject) => {
      server.listen(localPort, 'localhost', () => {
        this._options.logger.info(
          { localPort, namespace, podName, port },
          'Port forward established',
        );
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
