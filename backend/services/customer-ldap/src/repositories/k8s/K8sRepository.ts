import * as k8s from '@kubernetes/client-node';
import { FastifyBaseLogger } from 'fastify';
import { IK8sRepository } from './IK8sRepository';
import net from 'net';

export class K8sRepository implements IK8sRepository {
  constructor(private _options: { logger: FastifyBaseLogger }) {}

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
