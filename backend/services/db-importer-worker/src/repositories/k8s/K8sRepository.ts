import { Logger } from 'pino';
import * as k8s from '@kubernetes/client-node';
import { v1 as googleContainerV1 } from '@google-cloud/container';
import assert = require('assert');
import * as stream from 'stream';
import { STSClient, AssumeRoleWithWebIdentityCommand } from '@aws-sdk/client-sts';
import { EKSClient, DescribeClusterCommand } from '@aws-sdk/client-eks';
import axios from 'axios';

export class K8sRepository {
  constructor(private _options: { logger: Logger }) { }

  private async _getGKECredentials(clusterId: string, region: string) {
    const client = new googleContainerV1.ClusterManagerClient();

    const projectId = process.env.APPLICATION_PLANE_PROJECT_ID;
    assert(projectId, 'Env var APPLICATION_PLANE_PROJECT_ID is required');
    const accessToken = await client.auth.getAccessToken();

    const [response] = await client.getCluster({
      name: `projects/${projectId}/locations/${region}/clusters/c-${clusterId.replace('-', '')}`,
    });
    // the following are the parameters added when a new k8s context is created
    return {
      endpoint: `https://${response.endpoint}`,
      certificateAuthority: response.masterAuth.clusterCaCertificate,
      accessToken: accessToken,
    };
  }

  private async _getEKSCredentials(clusterId: string, region: string) {
    // get ID token from default GCP SA
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

    const sts = new STSClient({ region });

    const { Credentials } = await sts.send(
      new AssumeRoleWithWebIdentityCommand({
        RoleArn: process.env.AWS_ROLE_ARN,
        RoleSessionName: 'db-importer-worker',
        WebIdentityToken: idToken,
      }),
    );

    const eks = new EKSClient({
      credentials: {
        accessKeyId: Credentials?.AccessKeyId,
        secretAccessKey: Credentials?.SecretAccessKey,
        sessionToken: Credentials?.SessionToken,
      },
      region,
    });

    const { cluster } = await eks.send(new DescribeClusterCommand({ name: clusterId }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const EKSToken = require('aws-eks-token');
    EKSToken.config = {
      accessKeyId: Credentials?.AccessKeyId,
      secretAccessKey: Credentials?.SecretAccessKey,
      sessionToken: Credentials?.SessionToken,
      region,
    };

    const token = await EKSToken.renew(clusterId);

    return {
      endpoint: cluster.endpoint,
      certificateAuthority: cluster.certificateAuthority.data,
      accessToken: token,
    };
  }

  private async _getK8sConfig(
    cloudProvider: 'gcp' | 'aws',
    clusterId: string,
    region: string,
  ): Promise<k8s.KubeConfig> {
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

  private async _getDeploymentPassword(kubeConfig: k8s.KubeConfig, instanceId: string, podId: string): Promise<string> {

    const password = await this._executeCommand(kubeConfig, instanceId, podId, [
      'cat',
      '/run/secrets/adminpassword',
    ]).catch((e) => {
      console.error(e);
      throw e;
    });

    if (!password) {
      throw new Error('Could not get password');
    }

    return password.replace(/\n$/, '');
  }

  private async _executeCommand(kubeConfig: k8s.KubeConfig, instanceId: string, podId: string, command: string[]): Promise<string> {
    const exec = new k8s.Exec(kubeConfig);
    let result = '';
    // Create a new stream for the command output
    const output = new stream.Writable({
      write(chunk, encoding, callback) {
        result += chunk.toString();
        callback();
      },
    });

    await exec.exec(instanceId, podId, 'service', command, output, null, null, false);

    return new Promise((resolve, reject) => {
      output.on('finish', () => {
        resolve(result);
        output.end();
      });
      output.on('error', (error) => {
        console.error(error);
        reject(error);
      });
    });
  }
  async getFalkorDBDeploymentMode(
    cloudProvider: 'gcp' | 'aws',
    clusterId: string,
    region: string,
    instanceId: string,
    podId: string,
    hasTLS = false,
  ): Promise<string> {
    this._options.logger.info({ clusterId, region, instanceId, podId }, 'Getting FalkorDB deployment mode');

    const kubeConfig = await this._getK8sConfig(cloudProvider, clusterId, region);

    const password = await this._getDeploymentPassword(kubeConfig, instanceId, podId);

    const response = await this._executeCommand(
      kubeConfig,
      instanceId,
      podId,
      ['redis-cli', hasTLS ? '--tls' : '', '-a', password, '--no-auth-warning', 'info'].filter((c) => c),
    ).catch((e) => {
      console.error(e);
      throw e;
    });

    return response.match(/redis_mode:(.*)/)[1].trim();
  }

  async sendSaveCommand(
    cloudProvider: 'gcp' | 'aws',
    clusterId: string,
    region: string,
    instanceId: string,
    podId: string,
    hasTLS = false,
  ): Promise<void> {
    this._options.logger.info({ clusterId, region, instanceId, podId }, 'Sending save command');

    const kubeConfig = await this._getK8sConfig(cloudProvider, clusterId, region);

    const password = await this._getDeploymentPassword(kubeConfig, instanceId, podId);

    await this._executeCommand(
      kubeConfig,
      instanceId,
      podId,
      ['redis-cli', hasTLS ? '--tls' : '', '-a', password, '--no-auth-warning', 'bgsave'].filter((c) => c),
    ).catch((e) => {
      console.error(e);
      throw e;
    });
  }

  async isSaving(
    cloudProvider: 'gcp' | 'aws',
    clusterId: string,
    region: string,
    instanceId: string,
    podId: string,
    hasTLS = false,
  ): Promise<boolean> {
    this._options.logger.info({ clusterId, region, instanceId, podId }, 'Getting save status');

    const kubeConfig = await this._getK8sConfig(cloudProvider, clusterId, region);

    const password = await this._getDeploymentPassword(kubeConfig, instanceId, podId);

    const response = await this._executeCommand(
      kubeConfig,
      instanceId,
      podId,
      ['redis-cli', hasTLS ? '--tls' : '', '-a', password, '--no-auth-warning', 'info', 'persistence'].filter((c) => c),
    ).catch((e) => {
      console.error(e);
      throw e;
    });

    return response.includes('rdb_bgsave_in_progress:1');
  }

  async sendUploadCommand(
    cloudProvider: 'gcp' | 'aws',
    clusterId: string,
    region: string,
    instanceId: string,
    podId: string,
    signedWriteUrl: string,
  ): Promise<void> {
    this._options.logger.info({ clusterId, region, instanceId, podId }, 'Sending upload command');

    const kubeConfig = await this._getK8sConfig(cloudProvider, clusterId, region);

    await this._executeCommand(
      kubeConfig,
      instanceId,
      podId,
      ['curl', '-X', 'PUT', '-H', 'Content-Type: application/octet-stream', '--upload-file', '/data/dump.rdb', signedWriteUrl],
    ).catch((e) => {
      console.error(e);
      throw e;
    });
  }
}
