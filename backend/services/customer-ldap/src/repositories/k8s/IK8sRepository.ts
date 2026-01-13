import * as k8s from '@kubernetes/client-node';

export interface IK8sRepository {
  getPodNameByPrefix(kubeConfig: k8s.KubeConfig, namespace: string, podNamePrefix: string): Promise<string>;
  getSecretValueUtf8(
    kubeConfig: k8s.KubeConfig,
    namespace: string,
    secretName: string,
    key: string,
  ): Promise<string>;

  createPortForward(
    kubeConfig: k8s.KubeConfig,
    namespace: string,
    podName: string,
    port: number,
  ): Promise<{ localPort: number; close: () => void }>;
}

export const IK8sRepository = {
  repositoryName: 'IK8sRepository',
};
