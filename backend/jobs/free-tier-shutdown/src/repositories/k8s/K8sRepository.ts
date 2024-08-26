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
      // the endpoint set as 'cluster.server'
      endpoint: response.endpoint,
      // the certificate set as 'cluster.certificate-authority-data'
      certificateAuthority: response.masterAuth.clusterCaCertificate,
      // the accessToken set as 'user.auth-provider.config.access-token'
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

  async getFalkorDBInfo(
    clusterId: string,
    region: string,
    instanceId: string,
    hasTLS = false,
  ): Promise<FalkorDBInfoObjectSchemaType> {
    this._options.logger.info('Getting FalkorDB info', { clusterId, region, instanceId });

    const kubeConfig = await this._getK8sConfig(clusterId, region);

    const passwordResponse = await this._executeCommand(kubeConfig, instanceId, ['cat', '/run/secrets/adminpassword']);

    const response = await this._executeCommand(kubeConfig, instanceId, [
      'redis-cli',
      '-a',
      passwordResponse.replace(/\n$/, ''),
      '--no-auth-warning',
      hasTLS ? '--tls' : '',
      'info',
    ]);

    return {
      rdb_bgsave_in_progress: parseInt(response.match(/rdb_bgsave_in_progress:(\d+)/)?.[1]),
      rdb_saves: parseInt(response.match(/rdb_changes_since_last_save:(\d+)/)?.[1] || '0'),
      rdb_changes_since_last_save: parseInt(response.match(/rdb_changes_since_last_save:(\d+)/)?.[1] || '0'),
      rdb_last_save_time: parseInt(response.match(/rdb_last_save_time:(\d+)/)?.[1] || '0'),
    };
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

    exec.exec(instanceId, 'node-mz-0', 'service', command, output, null, null, false);

    return new Promise((resolve, reject) => {
      output.on('finish', () => {
        resolve(result);
        output.end();
      });
      output.on('error', (error) => {
        reject(error);
      });
    });
  }
}
