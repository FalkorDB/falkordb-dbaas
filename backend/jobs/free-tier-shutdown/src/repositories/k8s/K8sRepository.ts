import { FalkorDBInfoObjectSchemaType } from '../../schemas/FalkorDBInfoObject';
import { Logger } from 'pino';
import * as k8s from '@kubernetes/client-node';
import { v1 as googleContainerV1 } from '@google-cloud/container';
import assert = require('assert');
import * as stream from 'stream';
import { STSClient, AssumeRoleWithWebIdentityCommand } from '@aws-sdk/client-sts';
import { EKSClient, DescribeClusterCommand } from '@aws-sdk/client-eks';
import axios from 'axios';

export class K8sRepository {
  constructor(private _options: { logger: Logger }) {}

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
        RoleSessionName: 'free-tier-shutdown',
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

  private async _getDeploymentPassword(kubeConfig: k8s.KubeConfig, instanceId: string): Promise<string> {
    let password = '';
    if (!process.env.SKIP_K8S_ENV_CHECK) {
      const envResponse = await this._executeCommand(kubeConfig, instanceId, ['env']).catch((e) => {
        this._options.logger.error(e);
        throw e;
      });

      if (envResponse.includes('ADMIN_PASSWORD')) {
        password = envResponse.match(/ADMIN_PASSWORD=(.*)/)[1];
      }
    }

    if (!password) {
      const fileResponse = await this._executeCommand(kubeConfig, instanceId, [
        'cat',
        '/run/secrets/adminpassword',
      ]).catch((e) => {
        this._options.logger.error(e);
        throw e;
      });
      password = fileResponse;
    }

    if (!password) {
      throw new Error('Could not get password');
    }

    return password.replace(/\n$/, '');
  }

  private async _getFalkorDBGraphs(
    kubeConfig: k8s.KubeConfig,
    instanceId: string,
    hasTLS: boolean,
    password: string,
  ): Promise<string[]> {
    const response = await this._executeCommand(
      kubeConfig,
      instanceId,
      ['redis-cli', hasTLS ? '--tls' : '', '-a', password, '--no-auth-warning', 'GRAPH.LIST'].filter((c) => c),
    ).catch((e) => {
      this._options.logger.error(e);
      throw e;
    });

    return response.split('\n').filter((g) => g);
  }

  private async _getFalkorDBGraphLastQueryTime(
    kubeConfig: k8s.KubeConfig,
    instanceId: string,
    hasTLS: boolean,
    password: string,
    graph: string,
  ): Promise<number> {
    const response = await this._executeCommand(
      kubeConfig,
      instanceId,
      [
        'redis-cli',
        hasTLS ? '--tls' : '',
        '-a',
        password,
        '--no-auth-warning',
        'XREVRANGE',
        `telemetry{${graph}}`,
        '+',
        '-',
        'COUNT',
        '1',
      ].filter((c) => c),
    ).catch((e) => {
      this._options.logger.error(e);
      return null;
    });

    if (!response) {
      this._options.logger.error('No response for last query time for instance ' + instanceId);
      return null;
    }

    /**
     * Extract Received at from response:
     * 1) 1) "1725180135590-0"
   2)  1) "Received at"
       2) "1725180133"
       3) "Query"
       4) "create (n)"
       5) "Total duration"
       6) "21.613542"
       7) "Wait duration"
       8) "6.488792"
       9) "Execution duration"
      10) "13.990292"
      11) "Report duration"
      12) "1.134458"
      13) "Utilized cache"
      14) "0"
      15) "Write"
      16) "1"
      17) "Timeout"
      18) "0"
     * 
     */

    const receivedAt = response.split('\n')[2];

    if (!receivedAt) {
      this._options.logger.error('Could not parse last query time for instance ' + instanceId);
      return null;
    }

    return parseInt(receivedAt);
  }

  async getFalkorDBLastQueryTime(
    cloudProvider: 'gcp' | 'aws',
    clusterId: string,
    region: string,
    instanceId: string,
    hasTLS = false,
  ): Promise<number> {
    this._options.logger.info({ clusterId, region, instanceId }, 'Getting FalkorDB last query time');

    const kubeConfig = await this._getK8sConfig(cloudProvider, clusterId, region);

    const password = await this._getDeploymentPassword(kubeConfig, instanceId);

    const graphs = await this._getFalkorDBGraphs(kubeConfig, instanceId, hasTLS, password);

    if (!graphs.length) {
      this._options.logger.info({ clusterId, region, instanceId }, 'No graphs found');
      return await this.getFalkorDBInfo(cloudProvider, clusterId, region, instanceId, hasTLS).then(
        (info) => info.rdb_last_save_time * 1000,
      );
    }

    let lastQueryTime = 0;
    for (const graph of graphs) {
      const graphLastQueryTime = await this._getFalkorDBGraphLastQueryTime(
        kubeConfig,
        instanceId,
        hasTLS,
        password,
        graph,
      );
      if (!graphLastQueryTime) {
        continue;
      }
      lastQueryTime = Math.max(lastQueryTime, graphLastQueryTime);
    }

    return lastQueryTime * 1000;
  }

  async getFalkorDBInfo(
    cloudProvider: 'gcp' | 'aws',
    clusterId: string,
    region: string,
    instanceId: string,
    hasTLS = false,
  ): Promise<FalkorDBInfoObjectSchemaType> {
    this._options.logger.info({ clusterId, region, instanceId }, 'Getting FalkorDB info');

    const kubeConfig = await this._getK8sConfig(cloudProvider, clusterId, region);

    const password = await this._getDeploymentPassword(kubeConfig, instanceId);

    const response = await this._executeCommand(
      kubeConfig,
      instanceId,
      ['redis-cli', hasTLS ? '--tls' : '', '-a', password, '--no-auth-warning', 'info'].filter((c) => c),
    ).catch((e) => {
      this._options.logger.error(e);
      throw e;
    });

    const info = {
      rdb_bgsave_in_progress: parseInt(response.match(/rdb_bgsave_in_progress:(\d+)/)?.[1]),
      rdb_saves: parseInt(response.match(/rdb_changes_since_last_save:(\d+)/)?.[1] || '0'),
      rdb_changes_since_last_save: parseInt(response.match(/rdb_changes_since_last_save:(\d+)/)?.[1] || '0'),
      rdb_last_save_time: parseInt(response.match(/rdb_last_save_time:(\d+)/)?.[1] || '0'),
    };

    if (
      isNaN(info.rdb_bgsave_in_progress) ||
      isNaN(info.rdb_saves) ||
      isNaN(info.rdb_changes_since_last_save) ||
      isNaN(info.rdb_last_save_time)
    ) {
      throw new Error('Could not parse info');
    }

    return info;
  }

  private async _executeCommand(kubeConfig: k8s.KubeConfig, instanceId: string, command: string[]): Promise<string> {
    const exec = new k8s.Exec(kubeConfig);
    let result = '';
    // Create a new stream for the command output
    const output = new stream.Writable({
      write(chunk, encoding, callback) {
        result += chunk.toString();
        callback();
      },
    });

    await exec.exec(instanceId, 'node-f-0', 'service', command, output, null, null, false);

    return new Promise((resolve, reject) => {
      output.on('finish', () => {
        resolve(result);
        output.end();
      });
      output.on('error', (error) => {
        this._options.logger.error(error);
        reject(error);
      });
    });
  }
}
