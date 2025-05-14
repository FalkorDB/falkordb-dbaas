import * as k8s from '@kubernetes/client-node';
import { v1 as googleContainerV1 } from '@google-cloud/container';
import assert = require('assert');
import { Writable } from 'stream';
import { STSClient, AssumeRoleWithWebIdentityCommand } from '@aws-sdk/client-sts';
import { EKSClient, DescribeClusterCommand } from '@aws-sdk/client-eks';
import axios from 'axios';
import { FastifyBaseLogger } from 'fastify';

export class K8sRepository {
  constructor(private _options: { logger: FastifyBaseLogger }) { }

  private async _getGKECredentials(clusterId: string, region: string, opts?: {
    projectId?: string,
  }) {
    const client = new googleContainerV1.ClusterManagerClient();

    const projectId = opts?.projectId ?? process.env.APPLICATION_PLANE_PROJECT_ID;
    assert(projectId, 'Env var APPLICATION_PLANE_PROJECT_ID is required');
    const accessToken = await client.auth.getAccessToken();

    const [response] = await client.getCluster({
      name: `projects/${projectId}/locations/${region}/clusters/${clusterId}`,
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
    opts?: {
      projectId?: string,
    }
  ): Promise<k8s.KubeConfig> {
    const k8sCredentials =
      cloudProvider === 'gcp'
        ? await this._getGKECredentials(clusterId, region, opts)
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

  private async _executeCommand(kubeConfig: k8s.KubeConfig, instanceId: string, podId: string, command: string[], timeout = 60): Promise<string> {
    this._options.logger.info({ instanceId, podId, command }, 'Executing command');
    const exec = new k8s.Exec(kubeConfig);

    const stream = new Writable({
      write: (chunk, encoding, callback) => {
        callback();
      },
    });

    return new Promise((resolve, reject) => {
      let fullResponse = '';

      exec.exec(
        instanceId,
        podId,
        'service',
        command,
        stream,
        null,
        null, // Stdin
        false // TTY
      ).then(
        (stream) => {
          stream.on('message', (data: Buffer) => {
            fullResponse += data.toString('utf8');
          });

          stream.on('close', (code: number, signal: string) => {

            if (code === 0 || code === 1000) {
              const successMarker = '{"metadata":{},"status":"Success"}';
              // eslint-disable-next-line no-control-regex
              fullResponse = fullResponse.replace(/(\x01)|(\x03)/g, '')
              if (fullResponse.endsWith(successMarker)) {
                resolve(fullResponse.slice(0, -successMarker.length));
              } else {
                resolve(fullResponse);
              }
            } else {
              reject(`Command failed with code ${code}, signal ${signal}:\n${fullResponse}`);
            }
          });

          stream.on('error', (err: Error) => {
            reject(`Error executing command: ${err}`);
          });
        }
      ).catch(
        (err) => {
          reject(`Error creating exec stream: ${err}`);
        });
    });
  }

  async isUserAdmin(
    cloudProvider: 'gcp' | 'aws',
    clusterId: string,
    region: string,
    instanceId: string,
    podId: string,
    username: string,
    password: string,
    tls = false,
  ): Promise<boolean> {
    this._options.logger.info({ clusterId, region, instanceId, podId, username }, 'Checking if user is admin');

    const kubeConfig = await this._getK8sConfig(cloudProvider, clusterId, region);

    // the script should ping redis with the provided username and password and throw an error if it fails
    // if it succeeds, we must then get the user acl and check if the user has graph.query permissions
    let response = await this._executeCommand(
      kubeConfig,
      instanceId,
      podId,
      [
        'redis-cli',
        '--user',
        username,
        '-a',
        password,
        tls ? '--tls' : '',
        '--no-auth-warning',
        'ping',
      ].filter((c) => c),
    );

    console.log({ response, valid: response.toUpperCase().includes("PONG") });

    if (!response.toUpperCase().includes("PONG")) {
      this._options.logger.info({ response, clusterId, region, instanceId, podId, username }, 'User is not admin');
      return false;
    }

    response = await this._executeCommand(
      kubeConfig,
      instanceId,
      podId,
      [
        'sh',
        '-c',
        `cat /run/secrets/adminpassword | xargs -I {} redis-cli -a {} ${tls ? '--tls' : ''} --no-auth-warning acl getuser ${username}`
      ].filter((c) => c),
    );

    console.log({ response, valid: response.toUpperCase().includes("GRAPH.QUERY") });

    if (!response.toUpperCase().includes("GRAPH.QUERY")) {
      this._options.logger.info({ clusterId, region, instanceId, podId, username }, 'User is not admin');
      return false;
    }

    return true;
  }
}
