import * as k8s from '@kubernetes/client-node';

export interface IK8sCredentialsRepository {
  getKubeConfig(
    cloudProvider: 'gcp' | 'aws' | 'azure',
    clusterId: string,
    region: string,
  ): Promise<k8s.KubeConfig>;
}

export const IK8sCredentialsRepository = {
  repositoryName: 'IK8sCredentialsRepository',
};
