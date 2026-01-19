export interface ILdapRepository {
  listUsers(localPort: number, org: string, bearerToken: string, caCert: string): Promise<LdapUser[]>;
  createUser(
    localPort: number,
    org: string,
    bearerToken: string,
    caCert: string,
    user: CreateUserRequest,
  ): Promise<void>;
  modifyUser(
    localPort: number,
    org: string,
    bearerToken: string,
    caCert: string,
    username: string,
    user: ModifyUserRequest,
  ): Promise<void>;
  deleteUser(localPort: number, org: string, bearerToken: string, caCert: string, username: string): Promise<void>;
  getCaCertificate(localPort: number, bearerToken: string): Promise<string>;
  checkHealth(localPort: number): Promise<{ status: 'healthy' | 'unhealthy' }>;
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
