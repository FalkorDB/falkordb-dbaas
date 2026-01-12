import { FastifyBaseLogger } from 'fastify';
import { IK8sRepository } from '../repositories/k8s/IK8sRepository';
import { ILdapRepository, LdapUser, CreateUserRequest, ModifyUserRequest } from '../repositories/ldap/ILdapRepository';
import { IConnectionCacheRepository } from '../repositories/connection-cache/IConnectionCacheRepository';
import { LdapService } from './LdapService';
import * as assert from 'assert';
import { LDAP_NAMESPACE, LDAP_SERVICE_PORT } from '../constants';

export interface UserServiceOptions {
  logger: FastifyBaseLogger;
}

export class UserService {
  constructor(
    private _options: UserServiceOptions,
    private _k8sRepository: IK8sRepository,
    private _ldapRepository: ILdapRepository,
    private _connectionCache: IConnectionCacheRepository,
  ) {}

  async listUsers(
    instanceId: string,
    cloudProvider: 'gcp' | 'aws' | 'azure',
    k8sClusterName: string,
    region: string,
  ): Promise<LdapUser[]> {
    assert.ok(instanceId, 'UserService: Instance ID is required');
    assert.ok(cloudProvider, 'UserService: Cloud provider is required');
    assert.ok(k8sClusterName, 'UserService: K8s cluster name is required');
    assert.ok(region, 'UserService: Region is required');

    this._options.logger.info({ instanceId, cloudProvider, k8sClusterName, region }, 'Listing users');

    const connection = await this._getOrCreateConnection(instanceId, cloudProvider, k8sClusterName, region);
    const users = await connection.ldapService.listUsers();
    return users;
  }

  async createUser(
    instanceId: string,
    cloudProvider: 'gcp' | 'aws' | 'azure',
    k8sClusterName: string,
    region: string,
    user: CreateUserRequest,
  ): Promise<void> {
    assert.ok(instanceId, 'UserService: Instance ID is required');
    assert.ok(cloudProvider, 'UserService: Cloud provider is required');
    assert.ok(k8sClusterName, 'UserService: K8s cluster name is required');
    assert.ok(region, 'UserService: Region is required');
    assert.ok(user, 'UserService: User data is required');

    this._options.logger.info({ instanceId, cloudProvider, k8sClusterName, region, username: user.username }, 'Creating user');

    const connection = await this._getOrCreateConnection(instanceId, cloudProvider, k8sClusterName, region);
    await connection.ldapService.createUser(user);
  }

  async modifyUser(
    instanceId: string,
    cloudProvider: 'gcp' | 'aws' | 'azure',
    k8sClusterName: string,
    region: string,
    username: string,
    user: ModifyUserRequest,
  ): Promise<void> {
    assert.ok(instanceId, 'UserService: Instance ID is required');
    assert.ok(cloudProvider, 'UserService: Cloud provider is required');
    assert.ok(k8sClusterName, 'UserService: K8s cluster name is required');
    assert.ok(region, 'UserService: Region is required');
    assert.ok(username, 'UserService: Username is required');
    assert.ok(user, 'UserService: User data is required');

    this._options.logger.info({ instanceId, cloudProvider, k8sClusterName, region, username }, 'Modifying user');

    const connection = await this._getOrCreateConnection(instanceId, cloudProvider, k8sClusterName, region);
    await connection.ldapService.modifyUser(username, user);
  }

  async deleteUser(
    instanceId: string,
    cloudProvider: 'gcp' | 'aws' | 'azure',
    k8sClusterName: string,
    region: string,
    username: string,
  ): Promise<void> {
    assert.ok(instanceId, 'UserService: Instance ID is required');
    assert.ok(cloudProvider, 'UserService: Cloud provider is required');
    assert.ok(k8sClusterName, 'UserService: K8s cluster name is required');
    assert.ok(region, 'UserService: Region is required');
    assert.ok(username, 'UserService: Username is required');

    this._options.logger.info({ instanceId, cloudProvider, k8sClusterName, region, username }, 'Deleting user');

    const connection = await this._getOrCreateConnection(instanceId, cloudProvider, k8sClusterName, region);
    await connection.ldapService.deleteUser(username);
  }

  private async _getOrCreateConnection(
    instanceId: string,
    cloudProvider: 'gcp' | 'aws' | 'azure',
    k8sClusterName: string,
    region: string,
  ) {
    // Check cache first
    const cached = this._connectionCache.getConnection(instanceId);
    if (cached) {
      // Validate cached connection health
      const isHealthy = await this._connectionCache.validateConnection(instanceId);
      if (isHealthy) {
        return cached;
      }
      // If not healthy, create new connection (cache entry was removed by validateConnection)
      this._options.logger.info({ instanceId }, 'Cached connection unhealthy, creating new connection');
    }

    // Create new connection
    this._options.logger.info({ instanceId }, 'Creating new K8s connection');
    const kubeConfig = await this._k8sRepository.getK8sConfig(cloudProvider, k8sClusterName, region);
    const podName = await this._ldapRepository.getPodName(kubeConfig, LDAP_NAMESPACE);
    const portForward = await this._k8sRepository.createPortForward(kubeConfig, LDAP_NAMESPACE, podName, LDAP_SERVICE_PORT);
    const bearerToken = await this._ldapRepository.getBearerToken(kubeConfig, LDAP_NAMESPACE);
    const caCert = await this._ldapRepository.getCaCertificate(portForward.localPort);

    // Create LdapService
    const ldapService = new LdapService(
      {
        logger: this._options.logger,
        localPort: portForward.localPort,
        org: instanceId,
        bearerToken,
        caCert,
      },
      this._ldapRepository,
    );

    // Cache it
    const cachedConnection = {
      ldapService,
      close: portForward.close,
      createdAt: new Date(),
      instanceId,
      localPort: portForward.localPort,
    };
    this._connectionCache.setConnection(instanceId, cachedConnection);

    return cachedConnection;
  }
}
