import { FastifyBaseLogger } from 'fastify';
import { IK8sRepository } from '../repositories/k8s/IK8sRepository';
import { IK8sCredentialsRepository } from '../repositories/k8s-credentials/IK8sCredentialsRepository';
import { ILdapRepository, LdapUser, CreateUserRequest, ModifyUserRequest } from '../repositories/ldap/ILdapRepository';
import {
  IConnectionCacheRepository,
  CachedConnection,
} from '../repositories/connection-cache/IConnectionCacheRepository';
import { LdapService } from './LdapService';
import * as assert from 'assert';
import {
  LDAP_NAMESPACE,
  LDAP_SERVICE_PORT,
  LDAP_POD_PREFIX,
  LDAP_SECRET_NAME,
  LDAP_SECRET_TOKEN_KEY,
} from '../constants';

export interface UserServiceOptions {
  logger: FastifyBaseLogger;
}

export class UserService {
  constructor(
    private _options: UserServiceOptions,
    private _k8sRepository: IK8sRepository,
    private _k8sCredentialsRepository: IK8sCredentialsRepository,
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

    this._options.logger.info(
      { instanceId, cloudProvider, k8sClusterName, region, username: user.username },
      'Creating user',
    );

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
  ): Promise<CachedConnection> {
    // Check if there's an in-flight connection creation for this instance
    const inFlightPromise = this._connectionCache.getOrAwaitInFlight(instanceId);
    if (inFlightPromise) {
      this._options.logger.info({ instanceId }, 'Awaiting in-flight connection creation');
      return await inFlightPromise;
    }

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
      
      // Re-check in-flight connections after validation to prevent TOCTOU race
      const inFlightAfterValidation = this._connectionCache.getOrAwaitInFlight(instanceId);
      if (inFlightAfterValidation) {
        this._options.logger.info({ instanceId }, 'Another request started connection creation, awaiting');
        return await inFlightAfterValidation;
      }
    }

    // Create a promise for the new connection and store it to prevent concurrent creation
    const connectionPromise = this._createConnection(instanceId, cloudProvider, k8sClusterName, region);
    this._connectionCache.setInFlight(instanceId, connectionPromise);

    try {
      const connection = await connectionPromise;
      return connection;
    } finally {
      // Always remove the in-flight promise, whether successful or not
      this._connectionCache.removeInFlight(instanceId);
    }
  }

  private async _createConnection(
    instanceId: string,
    cloudProvider: 'gcp' | 'aws' | 'azure',
    k8sClusterName: string,
    region: string,
  ): Promise<CachedConnection> {
    this._options.logger.info({ instanceId }, 'Creating new K8s connection');

    let portForward: { localPort: number; close: () => void } | null = null;

    try {
      const kubeConfig = await this._k8sCredentialsRepository.getKubeConfig(cloudProvider, k8sClusterName, region);
      const podName = await this._k8sRepository.getPodNameByPrefix(kubeConfig, LDAP_NAMESPACE, LDAP_POD_PREFIX);
      portForward = await this._k8sRepository.createPortForward(kubeConfig, LDAP_NAMESPACE, podName, LDAP_SERVICE_PORT);
      const bearerToken = await this._k8sRepository.getSecretValueUtf8(
        kubeConfig,
        LDAP_NAMESPACE,
        LDAP_SECRET_NAME,
        LDAP_SECRET_TOKEN_KEY,
      );
      const caCert = await this._ldapRepository.getCaCertificate(portForward.localPort, bearerToken);

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
    } catch (error) {
      this._options.logger.error(
        { err: error, instanceId, cloudProvider, k8sClusterName, region },
        'Failed to create connection, cleaning up resources',
      );

      // Cleanup: close port forward if it was created
      if (portForward) {
        try {
          portForward.close();
          this._options.logger.info({ instanceId }, 'Cleaned up port forward after connection failure');
        } catch (closeError) {
          this._options.logger.error({ err: closeError, instanceId }, 'Failed to close port forward during cleanup');
        }
      }

      // Remove from cache if somehow it was added
      this._connectionCache.removeConnection(instanceId);

      throw error;
    }
  }
}
