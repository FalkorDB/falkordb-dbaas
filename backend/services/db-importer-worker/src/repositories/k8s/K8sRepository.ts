import { Logger } from 'pino';
import * as k8s from '@kubernetes/client-node';
import { v1 as googleContainerV1 } from '@google-cloud/container';
import assert = require('assert');
import { Writable } from 'stream';
import { STSClient, AssumeRoleWithWebIdentityCommand } from '@aws-sdk/client-sts';
import { EKSClient, DescribeClusterCommand } from '@aws-sdk/client-eks';
import axios from 'axios';

export class K8sRepository {
  constructor(private _options: { logger: Logger }) { }

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

  private async _getDeploymentPassword(kubeConfig: k8s.KubeConfig, instanceId: string, podId: string): Promise<string> {

    const password = await this._executeCommand(kubeConfig, instanceId, podId, [
      'cat',
      '/run/secrets/adminpassword',
    ]).catch((e) => {
      this._options.logger.error(e, 'Error getting deployment password');
      throw e;
    });

    if (!password) {
      throw new Error('Could not get password');
    }

    return password.replace(/\n$/, '');
  }

  private async _executeCommand(kubeConfig: k8s.KubeConfig, instanceId: string, podId: string, command: string[], timeout = 60): Promise<string> {
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
      this._options.logger.error(e, 'Error getting deployment mode');
      throw e;
    });

    if (response.includes("NOAUTH")) {
      throw new Error('Failed to authenticate to FalkorDB');
    }

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
    this._options.logger.info({ clusterId, region, instanceId, podId, cloudProvider }, 'Sending save command');

    const kubeConfig = await this._getK8sConfig(cloudProvider, clusterId, region);

    const password = await this._getDeploymentPassword(kubeConfig, instanceId, podId);

    const response = await this._executeCommand(
      kubeConfig,
      instanceId,
      podId,
      ['redis-cli', hasTLS ? '--tls' : '', '-a', password, '--no-auth-warning', 'bgsave'].filter((c) => c),
    ).catch((e) => {
      this._options.logger.error(e, 'Error sending save command');
      throw e;
    });

    if (response.includes("NOAUTH")) {
      throw new Error('Failed to authenticate to FalkorDB');
    }
  }

  async sendRewriteAofCommand(
    cloudProvider: 'gcp' | 'aws',
    clusterId: string,
    region: string,
    instanceId: string,
    podId: string,
    hasTLS = false,
  ): Promise<void> {
    this._options.logger.info({ clusterId, region, instanceId, podId, cloudProvider }, 'Sending rewrite aof command');

    const kubeConfig = await this._getK8sConfig(cloudProvider, clusterId, region);

    const password = await this._getDeploymentPassword(kubeConfig, instanceId, podId);

    const response = await this._executeCommand(
      kubeConfig,
      instanceId,
      podId,
      ['redis-cli', hasTLS ? '--tls' : '', '-a', password, '--no-auth-warning', 'bgrewriteaof'].filter((c) => c),
    ).catch((e) => {
      this._options.logger.error(e, 'Error sending bgrewriteaof command');
      throw e;
    });

    if (response.includes("NOAUTH")) {
      throw new Error('Failed to authenticate to FalkorDB');
    }
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
      this._options.logger.error(e, 'Error getting save status');
      throw e;
    });

    if (response.includes("NOAUTH")) {
      throw new Error('Failed to authenticate to FalkorDB');
    }

    return response.includes('rdb_bgsave_in_progress:1');
  }

  async isRewritingAof(
    cloudProvider: 'gcp' | 'aws',
    clusterId: string,
    region: string,
    instanceId: string,
    podId: string,
    hasTLS = false,
  ): Promise<boolean> {
    this._options.logger.info({ clusterId, region, instanceId, podId }, 'Getting aof rewrite status');

    const kubeConfig = await this._getK8sConfig(cloudProvider, clusterId, region);

    const password = await this._getDeploymentPassword(kubeConfig, instanceId, podId);

    const response = await this._executeCommand(
      kubeConfig,
      instanceId,
      podId,
      ['redis-cli', hasTLS ? '--tls' : '', '-a', password, '--no-auth-warning', 'info', 'persistence'].filter((c) => c),
    ).catch((e) => {
      this._options.logger.error(e, 'Error getting save status');
      throw e;
    });

    if (response.includes("NOAUTH")) {
      throw new Error('Failed to authenticate to FalkorDB');
    }

    return response.includes('aof_rewrite_in_progress:1');
  }

  async getKeyCountFromAllPods(
    cloudProvider: 'gcp' | 'aws',
    clusterId: string,
    region: string,
    instanceId: string,
    podId: string,
    hasTLS = false,
    isCluster = false,
  ): Promise<number> {
    this._options.logger.info({ clusterId, region, instanceId, podId }, 'Getting key count');

    const kubeConfig = await this._getK8sConfig(cloudProvider, clusterId, region);

    const password = await this._getDeploymentPassword(kubeConfig, instanceId, podId);

    const shellCommand: string = isCluster ? `(
            INITIAL_HOST="${podId}";
            INITIAL_PORT="6379";
            
            # Get IP:Port of all master nodes, excluding the cluster bus port
            MASTER_NODES=$(redis-cli ${hasTLS ? '--tls' : ''} -a ${password} --no-auth-warning -h "$INITIAL_HOST" -p "$INITIAL_PORT" CLUSTER NODES 2>/dev/null | \\
                grep master | \\
                awk '{print $2}' | \\
                cut -d'@' -f1);

            # Loop through each master node and run graph.list
            for NODE in $MASTER_NODES; do
                IP=$(echo "$NODE" | cut -d: -f1);
                PORT=$(echo "$NODE" | cut -d: -f2);
                # Use 2>/dev/null to suppress connection errors for unreachable nodes, if any
                redis-cli  ${hasTLS ? '--tls' : ''} -a ${password} --no-auth-warning -h "$IP" -p "$PORT" graph.list 2>/dev/null;
            done
        ) | grep -v '^(empty array)' | grep -cve '^s*$'` :
      `(
          RESPONSE=$(redis-cli ${hasTLS ? '--tls' : ''} -a ${password} --no-auth-warning graph.list | grep -v '^(empty array)');
          if [[ "$RESPONSE" == *"(empty array)"* ]] || [[ -z "$RESPONSE" ]]; then
            echo "0";
          else
            echo "$RESPONSE" | wc -l;
          fi
        )`;

    const response = await this._executeCommand(
      kubeConfig,
      instanceId,
      podId,
      [
        'sh',
        '-c',
        shellCommand,
      ],
    ).catch((e) => {
      this._options.logger.error(e, 'Error getting key count');
      throw e;
    });

    if (parseInt(response, 10) < 0) {
      this._options.logger.error({ response }, 'Invalid key count response');
      throw new Error('Invalid key count response');
    }

    return parseInt(response, 10);
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
      this._options.logger.error(e, 'Error sending upload command');
      throw e;
    });
  }

  async createMergeRDBsJob(
    projectId: string,
    cloudProvider: 'gcp' | 'aws',
    clusterId: string,
    region: string,
    namespace: string,
    jobId: string,
    bucketName: string,
    rdbFileNames: string[],
    outputRdbFileName: string,
  ): Promise<void> {
    this._options.logger.info({ clusterId, region, namespace, rdbFileNames }, 'Creating merge RDBs job');

    const kubeConfig = await this._getK8sConfig(cloudProvider, clusterId, region, { projectId });

    const jobManifest: k8s.V1Job = {
      apiVersion: 'batch/v1',
      kind: 'Job',
      metadata: {
        name: `merge-rdbs-job-${jobId}`,
        namespace,
      },
      spec: {
        maxFailedIndexes: 1,
        backoffLimitPerIndex: 0,
        completionMode: 'Indexed',
        template: {
          metadata: {
            annotations: {
              "gke-gcsfuse/volumes": "true",
              // service account
            }
          },
          spec: {
            serviceAccountName: 'db-exporter-sa',
            containers: [
              {
                name: 'merge-rdbs',
                image: 'dudizimber/redis-rdb-cli:latest',
                command: ['rdt', '-m', ...rdbFileNames.map(n => `/data/${n}`), '-o', `/data/${outputRdbFileName}`],
                volumeMounts: [
                  {
                    name: 'gcsfuse',
                    mountPath: '/data',
                  }
                ]
              },
            ],
            restartPolicy: 'Never',
            volumes: [
              {
                name: 'gcsfuse',
                csi: {
                  driver: 'gcsfuse.csi.storage.gke.io',
                  volumeAttributes: {
                    bucketName,
                    mountOptions: 'implicit-dirs',
                  },
                }
              }
            ]
          },
        },
      },
    };

    const k8sApi = kubeConfig.makeApiClient(k8s.BatchV1Api);
    await k8sApi.createNamespacedJob(namespace, jobManifest);
  }

  async createImportRDBJob(
    projectId: string,
    cloudProvider: 'gcp' | 'aws',
    clusterId: string,
    region: string,
    namespace: string,
    jobId: string,
    podId: string,
    hasTLS: boolean,
    downloadUrl: string,
  ): Promise<void> {
    this._options.logger.info({
      clusterId, region, namespace, jobId, podId, hasTLS, downloadUrl
    }, 'Creating import RDB job');

    const kubeConfig = await this._getK8sConfig(cloudProvider, clusterId, region, { projectId });

    const k8sCoreApi = kubeConfig.makeApiClient(k8s.CoreV1Api);
    const secrets = await k8sCoreApi.listNamespacedSecret(namespace).then((res) => res.body.items);

    const shellCommand = `(
      apk --update add curl redis;
      curl -X GET -H "Accept: application/octet-stream" --output /data/dump.rdb "${downloadUrl}";
      
      info=$(redis-cli ${hasTLS ? '--tls' : ''} -h ${podId} -a $(echo $adminpassword) --no-auth-warning info);
      
      podId="${podId}";
      if echo "$info" | grep -q "redis_mode:standalone"; then
        if echo "$info" | grep -q "role:slave"; then
          master=$(echo "$info" | grep "master_host" | cut -d':' -f2 | tr -d ' ' | tr -d '\r');
          podId="$master";
        fi
      fi

      url="${hasTLS ?
        `rediss://:$(echo $adminpassword)@$podId:6379` :
        `redis://:$(echo $adminpassword)@$podId:6379`}"

      rmt -s /data/dump.rdb -m $url -r
    )`;

    const jobManifest: k8s.V1Job = {
      apiVersion: 'batch/v1',
      kind: 'Job',
      metadata: {
        name: jobId,
        namespace,
      },
      spec: {
        maxFailedIndexes: 1,
        backoffLimitPerIndex: 0,
        completionMode: 'Indexed',
        template: {
          spec: {
            containers: [
              {
                name: 'import-rdb',
                image: 'dudizimber/redis-rdb-cli:latest',
                command: ['sh', '-c', shellCommand],
                volumeMounts: [
                  {
                    name: 'emptydir',
                    mountPath: '/data',
                  },
                ],
                envFrom: secrets.filter((s) => s.metadata?.name.startsWith('file')).map((s) => ({
                  secretRef: {
                    name: s.metadata?.name,
                  }
                }))
              },
            ],
            restartPolicy: 'Never',
            volumes: [
              {
                name: 'emptydir',
                emptyDir: {},
              },
            ]
          },
        },
      },
    };

    const k8sApi = kubeConfig.makeApiClient(k8s.BatchV1Api);
    await k8sApi.createNamespacedJob(namespace, jobManifest);

  }

  async createValidateRdbFormatJob(
    projectId: string,
    cloudProvider: 'gcp' | 'aws',
    clusterId: string,
    region: string,
    namespace: string,
    jobId: string,
    bucketName: string,
    fileName: string,
    outputFileName: string,
  ): Promise<void> {
    this._options.logger.info({ clusterId, region, namespace, bucketName, fileName, outputFileName }, 'Creating validate RDB format job');

    const kubeConfig = await this._getK8sConfig(cloudProvider, clusterId, region, { projectId });

    const shellCommand: string = `(
      rct -f count -t module -s /data/${fileName} -o count.csv && \
      echo "$(cat count.csv | awk -F',' 'NR==2 {print $1}')" > /data/${outputFileName}
    )`;

    const jobManifest: k8s.V1Job = {
      apiVersion: 'batch/v1',
      kind: 'Job',
      metadata: {
        name: jobId,
        namespace,
      },
      spec: {
        maxFailedIndexes: 1,
        backoffLimitPerIndex: 0,
        completionMode: 'Indexed',
        template: {
          metadata: {
            annotations: {
              "gke-gcsfuse/volumes": "true",
            }
          },
          spec: {
            serviceAccountName: 'db-exporter-sa',
            containers: [
              {
                name: 'redis-rdb-cli',
                image: 'dudizimber/redis-rdb-cli:latest',
                command: ['sh', '-c', shellCommand],
                volumeMounts: [
                  {
                    name: 'gcsfuse',
                    mountPath: '/data',
                  }
                ]
              },
            ],
            restartPolicy: 'Never',
            volumes: [
              {
                name: 'gcsfuse',
                csi: {
                  driver: 'gcsfuse.csi.storage.gke.io',
                  volumeAttributes: {
                    bucketName,
                    mountOptions: 'implicit-dirs',
                  },
                }
              }
            ]
          },
        },
      },
    };

    const k8sApi = kubeConfig.makeApiClient(k8s.BatchV1Api);
    await k8sApi.createNamespacedJob(namespace, jobManifest);
  }

  async createValidateRdbSizeJob(
    projectId: string,
    cloudProvider: 'gcp' | 'aws',
    clusterId: string,
    region: string,
    namespace: string,
    jobId: string,
    bucketName: string,
    fileName: string,
    outputFileName: string,
  ): Promise<void> {
    this._options.logger.info({ clusterId, region, namespace, bucketName, fileName, outputFileName }, 'Creating validate RDB size job');

    const kubeConfig = await this._getK8sConfig(cloudProvider, clusterId, region, { projectId });

    const shellCommand: string = `(
      rdb-used-memory /data/${fileName} > /data/${outputFileName}
    )`;

    const jobManifest: k8s.V1Job = {
      apiVersion: 'batch/v1',
      kind: 'Job',
      metadata: {
        name: jobId,
        namespace,
      },
      spec: {
        maxFailedIndexes: 1,
        backoffLimitPerIndex: 0,
        completionMode: 'Indexed',
        template: {
          metadata: {
            annotations: {
              "gke-gcsfuse/volumes": "true",
            }
          },
          spec: {
            serviceAccountName: 'db-exporter-sa',
            containers: [
              {
                name: 'rdb-used-memory',
                image: 'falkordb/rdb-used-memory:v1.1.0',
                command: ['sh', '-c', shellCommand],
                volumeMounts: [
                  {
                    name: 'gcsfuse',
                    mountPath: '/data',
                  }
                ]
              },
            ],
            restartPolicy: 'Never',
            volumes: [
              {
                name: 'gcsfuse',
                csi: {
                  driver: 'gcsfuse.csi.storage.gke.io',
                  volumeAttributes: {
                    bucketName,
                    mountOptions: 'implicit-dirs',
                  },
                }
              }
            ]
          },
        },
      },
    };

    const k8sApi = kubeConfig.makeApiClient(k8s.BatchV1Api);
    await k8sApi.createNamespacedJob(namespace, jobManifest);
  }

  async getJobStatus(
    projectId: string,
    cloudProvider: 'gcp' | 'aws',
    clusterId: string,
    region: string,
    namespace: string,
    jobId: string,
  ): Promise<'pending' | 'completed' | 'failed'> {
    this._options.logger.info({ clusterId, region, namespace, jobId }, 'Getting job status');

    const kubeConfig = await this._getK8sConfig(cloudProvider, clusterId, region, { projectId });

    const k8sApi = kubeConfig.makeApiClient(k8s.BatchV1Api);
    const { body } = await k8sApi.readNamespacedJob(`${jobId}`, namespace);
    const { status } = body;

    if (status?.failed > 0) {
      return 'failed';
    }

    if (status?.succeeded > 0) {
      return 'completed';
    }

    return 'pending';
  }

  async makeLocalBackup(
    cloudProvider: 'gcp' | 'aws',
    clusterId: string,
    region: string,
    namespace: string,
    podId: string,
    aofEnabled: boolean,
    backupPath: string,
  ): Promise<void> {
    this._options.logger.info({ clusterId, region, namespace, podId, aofEnabled, backupPath }, 'Making local backup');

    const kubeConfig = await this._getK8sConfig(cloudProvider, clusterId, region);

    await this._executeCommand(
      kubeConfig,
      namespace,
      podId,
      aofEnabled ?
        ['cp', '-rf', '/data/appendonlydir', backupPath] :
        ['cp', '/data/dump.rdb', backupPath],
    ).catch((e) => {
      this._options.logger.error(e, 'Error making local backup');
      throw e;
    });
  }

  async restoreLocalBackup(
    cloudProvider: 'gcp' | 'aws',
    clusterId: string,
    region: string,
    namespace: string,
    podIds: string[],
    aofEnabled: boolean,
    backupPath: string,
  ): Promise<void> {
    this._options.logger.info({ clusterId, region, namespace, podIds, aofEnabled, backupPath }, 'Copying local backup folder');

    const kubeConfig = await this._getK8sConfig(cloudProvider, clusterId, region);

    for (const podId of podIds) {
      try {
        await this._executeCommand(
          kubeConfig,
          namespace,
          podId,
          aofEnabled ?
            ['mv', '-rf', backupPath, '/data/appendonlydir'] :
            ['mv', backupPath, '/data/dump.rdb'],
        );
      } catch (e) {
        this._options.logger.error(e, `Error copying local backup folder from pod ${podId}`);
        throw e;
      }
    }
  }

  async deleteLocalBackup(
    cloudProvider: 'gcp' | 'aws',
    clusterId: string,
    region: string,
    namespace: string,
    podId: string,
    backupPath: string,
  ): Promise<void> {
    this._options.logger.info({ clusterId, region, namespace, podId }, 'Deleting local backup');

    const kubeConfig = await this._getK8sConfig(cloudProvider, clusterId, region);

    await this._executeCommand(
      kubeConfig,
      namespace,
      podId,
      ['rm', '-rf', backupPath],
    )
  }

  async flushInstance(
    cloudProvider: 'gcp' | 'aws',
    clusterId: string,
    region: string,
    namespace: string,
    podId: string,
    hasTLS = false,
    isCluster: boolean = false,
  ): Promise<void> {
    this._options.logger.info({ clusterId, region, namespace, podId }, 'Flushing instance');

    const kubeConfig = await this._getK8sConfig(cloudProvider, clusterId, region);

    const password = await this._getDeploymentPassword(kubeConfig, namespace, podId);

    await this._executeCommand(
      kubeConfig,
      namespace,
      podId,
      ['redis-cli', hasTLS ? '--tls' : '', '-a', password, '--no-auth-warning', isCluster ? '-c call localhost:6379' : '', 'flushall'].filter((c) => c),
    ).catch((e) => {
      this._options.logger.error(e, 'Error flushing instance');
      throw e;
    });
  }

  async deletePods(
    cloudProvider: 'gcp' | 'aws',
    clusterId: string,
    region: string,
    namespace: string,
    podIds: string[],
  ): Promise<void> {
    this._options.logger.info({ clusterId, region, namespace, podIds }, 'Deleting pods');

    const kubeConfig = await this._getK8sConfig(cloudProvider, clusterId, region);

    const k8sApi = kubeConfig.makeApiClient(k8s.CoreV1Api);

    for (const podId of podIds) {
      try {
        await k8sApi.deleteNamespacedPod(podId, namespace, undefined, undefined, 0);
      } catch (e) {
        this._options.logger.error(e, `Error deleting pod ${podId}`);
        throw e;
      }
    }
  }
}
