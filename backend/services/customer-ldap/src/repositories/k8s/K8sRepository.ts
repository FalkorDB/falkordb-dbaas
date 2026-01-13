import * as k8s from '@kubernetes/client-node';
import { FastifyBaseLogger } from 'fastify';
import { IK8sRepository } from './IK8sRepository';
import net from 'net';
import assert from 'assert';

export class K8sRepository implements IK8sRepository {
  constructor(private _options: { logger: FastifyBaseLogger }) {}

  async getPodNameByPrefix(
    kubeConfig: k8s.KubeConfig,
    namespace: string,
    podNamePrefix: string,
  ): Promise<string> {
    assert(namespace, 'K8sRepository: namespace is required');
    assert(podNamePrefix, 'K8sRepository: podNamePrefix is required');

    this._options.logger.info({ namespace, podNamePrefix }, 'Getting pod name by prefix');

    const k8sApi = kubeConfig.makeApiClient(k8s.CoreV1Api);
    const podsResponse = await k8sApi.listNamespacedPod(namespace);
    const pod = podsResponse.body.items.find((p) => p.metadata?.name?.startsWith(podNamePrefix));

    if (!pod?.metadata?.name) {
      throw new Error(`Pod not found in namespace ${namespace} with prefix: ${podNamePrefix}`);
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

    const k8sApi = kubeConfig.makeApiClient(k8s.CoreV1Api);
    const secretResponse = await k8sApi.readNamespacedSecret(secretName, namespace);
    const valueBase64 = secretResponse.body.data?.[key];

    if (!valueBase64) {
      throw new Error(`${key} not found in secret ${secretName}`);
    }

    return Buffer.from(valueBase64, 'base64').toString('utf-8');
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
