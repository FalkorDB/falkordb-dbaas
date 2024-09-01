import { FalkorDBInfoObjectSchemaType } from '../../schemas/FalkorDBInfoObject';
import { Logger } from 'pino';
import * as k8s from '@kubernetes/client-node';
import { v1 as googleContainerV1 } from '@google-cloud/container';
import assert = require('assert');
import * as stream from 'stream';

// Create the Cluster Manager Client
const client = new googleContainerV1.ClusterManagerClient();

export class K8sRepository {
  constructor(private _options: { logger: Logger }) {}

  private async _getGKECredentials(clusterId: string, region: string) {
    const projectId = process.env.APPLICATION_PLANE_PROJECT_ID;
    assert(projectId, 'Env var APPLICATION_PLANE_PROJECT_ID is required');
    const accessToken = await client.auth.getAccessToken();

    const [response] = await client.getCluster({
      name: `projects/${projectId}/locations/${region}/clusters/${clusterId}`,
    });
    // the following are the parameters added when a new k8s context is created
    return {
      endpoint: response.endpoint,
      certificateAuthority: response.masterAuth.clusterCaCertificate,
      accessToken: accessToken,
    };
  }

  private async _getK8sConfig(clusterId: string, region: string): Promise<k8s.KubeConfig> {
    const k8sCredentials = await this._getGKECredentials(clusterId, region);

    const kubeConfig = new k8s.KubeConfig();
    kubeConfig.loadFromOptions({
      clusters: [
        {
          name: clusterId,
          caData: k8sCredentials.certificateAuthority,
          server: `https://${k8sCredentials.endpoint}`,
        },
      ],
      users: [
        {
          name: clusterId,
          authProvider: 'gcp',
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
        console.error(e);
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
        console.error(e);
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
      console.error(e);
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
      console.error(e);
      throw e;
    });

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
      throw new Error('Could not parse last query time');
    }

    return parseInt(receivedAt);
  }

  async getFalkorDBLastQueryTime(
    clusterId: string,
    region: string,
    instanceId: string,
    hasTLS = false,
  ): Promise<number> {
    this._options.logger.info({ clusterId, region, instanceId }, 'Getting FalkorDB last query time');

    const kubeConfig = await this._getK8sConfig(clusterId, region);

    const password = await this._getDeploymentPassword(kubeConfig, instanceId);

    const graphs = await this._getFalkorDBGraphs(kubeConfig, instanceId, hasTLS, password);

    if (!graphs.length) {
      this._options.logger.info({ clusterId, region, instanceId }, 'No graphs found');
      return await this.getFalkorDBInfo(clusterId, region, instanceId, hasTLS).then((info) => info.rdb_last_save_time);
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
      lastQueryTime = Math.max(lastQueryTime, graphLastQueryTime);
    }

    return lastQueryTime * 1000;
  }

  async getFalkorDBInfo(
    clusterId: string,
    region: string,
    instanceId: string,
    hasTLS = false,
  ): Promise<FalkorDBInfoObjectSchemaType> {
    this._options.logger.info({ clusterId, region, instanceId }, 'Getting FalkorDB info');

    const kubeConfig = await this._getK8sConfig(clusterId, region);

    const password = await this._getDeploymentPassword(kubeConfig, instanceId);

    const response = await this._executeCommand(
      kubeConfig,
      instanceId,
      ['redis-cli', hasTLS ? '--tls' : '', '-a', password, '--no-auth-warning', 'info'].filter((c) => c),
    ).catch((e) => {
      console.error(e);
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
        console.error(error);
        reject(error);
      });
    });
  }
}
