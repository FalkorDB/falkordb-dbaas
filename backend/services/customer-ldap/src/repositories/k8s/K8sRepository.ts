import * as k8s from '@kubernetes/client-node';
import { FastifyBaseLogger } from 'fastify';
import { IK8sRepository } from './IK8sRepository';
import net from 'net';
import assert from 'assert';
import { ApiError } from '@falkordb/errors';

export class K8sRepository implements IK8sRepository {
  constructor(private _options: { logger: FastifyBaseLogger }) {}

  async getPodNameByPrefix(kubeConfig: k8s.KubeConfig, namespace: string, podNamePrefix: string): Promise<string> {
    assert(namespace, 'K8sRepository: namespace is required');
    assert(podNamePrefix, 'K8sRepository: podNamePrefix is required');

    this._options.logger.info({ namespace, podNamePrefix }, 'Getting pod name by prefix');

    const k8sApi = kubeConfig.makeApiClient(k8s.CoreV1Api);
    const podsResponse = await k8sApi.listNamespacedPod(namespace);
    const pod = podsResponse.body.items.find((p) => p.metadata?.name?.startsWith(podNamePrefix));

    if (!pod?.metadata?.name) {
      throw ApiError.notFound(`Pod not found in namespace ${namespace} with prefix: ${podNamePrefix}`, 'POD_NOT_FOUND');
    }

    this._options.logger.info({ namespace, podName: pod.metadata.name }, 'Found pod');
    return pod.metadata.name;
  }

  async getSecretValueUtf8(
    kubeConfig: k8s.KubeConfig,
    namespace: string,
    secretName: string,
    key: string,
  ): Promise<string> {
    assert(namespace, 'K8sRepository: namespace is required');
    assert(secretName, 'K8sRepository: secretName is required');
    assert(key, 'K8sRepository: key is required');

    this._options.logger.info({ namespace, secretName, key }, 'Getting secret value');
    try {
      const k8sApi = kubeConfig.makeApiClient(k8s.CoreV1Api);
      const secretResponse = await k8sApi.readNamespacedSecret(secretName, namespace);
      const valueBase64 = secretResponse.body.data?.[key];

      if (!valueBase64) {
        throw ApiError.notFound(`${key} not found in secret ${secretName}`, 'SECRET_KEY_NOT_FOUND');
      }
      return Buffer.from(valueBase64, 'base64').toString('utf-8');
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error.statusCode === 404) {
        throw ApiError.notFound(`Secret ${secretName} not found in namespace ${namespace}`, 'SECRET_NOT_FOUND');
      }
      this._options.logger.error({ error, namespace, secretName, key }, 'Error getting secret value');
      throw ApiError.internalServerError('Error retrieving secret value', 'SECRET_RETRIEVAL_ERROR');
    }
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

    this._options.logger.info({ localPort, namespace, podName, port }, 'Establishing port forward');

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
