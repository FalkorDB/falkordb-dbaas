import * as k8s from '@kubernetes/client-node';

export interface ILdapRepository {
  listUsers(localPort: number, org: string, bearerToken: string, caCert: string): Promise<LdapUser[]>;
  createUser(localPort: number, org: string, bearerToken: string, caCert: string, user: CreateUserRequest): Promise<void>;
  modifyUser(localPort: number, org: string, bearerToken: string, caCert: string, username: string, user: ModifyUserRequest): Promise<void>;
  deleteUser(localPort: number, org: string, bearerToken: string, caCert: string, username: string): Promise<void>;
  getPodName(kubeConfig: k8s.KubeConfig, namespace: string): Promise<string>;
  getBearerToken(kubeConfig: k8s.KubeConfig, namespace: string): Promise<string>;
  getCaCertificate(localPort: number): Promise<string>;
}

export interface LdapUser {
  username: string;
  acl: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  acl: string;
}

export interface ModifyUserRequest {
  password?: string;
  acl?: string;
}

export const ILdapRepository = {
  repositoryName: 'ILdapRepository',
};
