import * as k8s from '@kubernetes/client-node';

export interface IK8sRepository {
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
