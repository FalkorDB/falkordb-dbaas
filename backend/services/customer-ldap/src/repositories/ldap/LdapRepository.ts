import axios from 'axios';
import assert from 'assert';
import { FastifyBaseLogger } from 'fastify';
import * as k8s from '@kubernetes/client-node';
import * as https from 'https';
import {
  ILdapRepository,
  LdapUser,
  CreateUserRequest,
  ModifyUserRequest,
} from './ILdapRepository';
import { LDAP_POD_PREFIX, LDAP_SECRET_NAME, LDAP_SECRET_TOKEN_KEY } from '../../constants';

export class LdapRepository implements ILdapRepository {
  constructor(private _options: { logger: FastifyBaseLogger }) {}

  private _sanitizeError(error: unknown, operation: string): Record<string, unknown> {
    const sanitized: Record<string, unknown> = { operation };
    
    if (error instanceof Error) {
      sanitized.message = error.message;
    }
    
    if (axios.isAxiosError(error)) {
      sanitized.status = error.response?.status ?? error.status;
      sanitized.code = error.code;
      sanitized.url = error.config?.url ?? error.response?.request?.path;
    }
    
    return sanitized;
  }

  async getPodName(kubeConfig: k8s.KubeConfig, namespace: string): Promise<string> {
    this._options.logger.info({ namespace }, 'Getting LDAP pod name');

    const k8sApi = kubeConfig.makeApiClient(k8s.CoreV1Api);
    
    const podsResponse = await k8sApi.listNamespacedPod(namespace);
    const ldapPod = podsResponse.body.items.find((pod) =>
      pod.metadata?.name?.startsWith(LDAP_POD_PREFIX),
    );

    if (!ldapPod) {
      throw new Error('LDAP pod not found in namespace: ' + namespace);
    }

    return ldapPod.metadata.name;
  }

  async getBearerToken(kubeConfig: k8s.KubeConfig, namespace: string): Promise<string> {
    this._options.logger.info({ namespace }, 'Getting LDAP bearer token from secret');

    const k8sApi = kubeConfig.makeApiClient(k8s.CoreV1Api);
    
    try {
      const secretResponse = await k8sApi.readNamespacedSecret(LDAP_SECRET_NAME, namespace);
      const token = secretResponse.body.data?.[LDAP_SECRET_TOKEN_KEY];
      
      if (!token) {
        throw new Error(`${LDAP_SECRET_TOKEN_KEY} not found in secret ${LDAP_SECRET_NAME}`);
      }

      // Decode base64
      return Buffer.from(token, 'base64').toString('utf-8');
    } catch (error) {
      const sanitizedError = this._sanitizeError(error, 'getBearerToken');
      this._options.logger.error({ error: sanitizedError, namespace }, 'Error reading LDAP bearer token secret');
      throw new Error('Failed to read LDAP bearer token from Kubernetes secret');
    }
  }

  async getCaCertificate(localPort: number): Promise<string> {
    assert(localPort, 'LdapRepository: Local port is required');
    
    this._options.logger.info({ localPort }, 'Getting LDAP CA certificate');

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false, // Allow insecure requests to fetch the CA cert
    });

    try {
      const response = await axios.get(`https://localhost:${localPort}/api/v1/ca-certificate`, {
        httpsAgent,
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      const sanitizedError = this._sanitizeError(error, 'getCaCertificate');
      this._options.logger.error({ error: sanitizedError, localPort }, 'Error getting LDAP CA certificate');
      throw new Error('Failed to get CA certificate from LDAP server');
    }
  }

  async listUsers(localPort: number, org: string, bearerToken: string, caCert: string): Promise<LdapUser[]> {
    assert(localPort, 'LdapRepository: Local port is required');
    assert(org, 'LdapRepository: Organization is required');
    assert(bearerToken, 'LdapRepository: Bearer token is required');
    assert(caCert, 'LdapRepository: CA certificate is required');
    
    this._options.logger.info({ localPort, org }, 'Listing LDAP users');

    const httpsAgent = new https.Agent({
      ca: caCert,
    });

    try {
      // Get users
      const usersResponse = await axios.get(`https://localhost:${localPort}/api/users/${encodeURIComponent(org)}`, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
        },
        httpsAgent,
        timeout: 10000,
      });

      const users = usersResponse.data.users || [];

      // Get all groups to retrieve ACL from descriptions
      const groupsResponse = await axios.get(`https://localhost:${localPort}/api/groups/${encodeURIComponent(org)}`, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
        },
        httpsAgent,
        timeout: 10000,
      });

      const groups = groupsResponse.data.groups || [];

      // Create a map of username -> ACL from groups
      const aclMap = new Map<string, string>();
      groups.forEach((group: { name: string; description?: string }) => {
        aclMap.set(group.name, group.description || '');
      });

      // Map users to include ACL from groups
      const usersWithAcl = users.map((user: { username: string }) => ({
        username: user.username,
        acl: aclMap.get(user.username) || '',
      }));

      return usersWithAcl;
    } catch (error) {
      const sanitizedError = this._sanitizeError(error, 'listUsers');
      this._options.logger.error({ error: sanitizedError, localPort, org }, 'Error listing LDAP users');
      throw new Error('Failed to list users from LDAP server');
    }
  }

  async createUser(localPort: number, org: string, bearerToken: string, caCert: string, user: CreateUserRequest): Promise<void> {
    assert(localPort, 'LdapRepository: Local port is required');
    assert(org, 'LdapRepository: Organization is required');
    assert(bearerToken, 'LdapRepository: Bearer token is required');
    assert(caCert, 'LdapRepository: CA certificate is required');
    assert(user.username, 'LdapRepository: Username is required');
    assert(user.password, 'LdapRepository: Password is required');
    assert(user.acl, 'LdapRepository: ACL is required');

    this._options.logger.info({ localPort, org, username: user.username }, 'Creating LDAP user and group');

    const httpsAgent = new https.Agent({
      ca: caCert,
    });

    let userCreated = false;
    let groupCreated = false;

    try {
      // Create user
      await axios.post(
        `https://localhost:${localPort}/api/users`,
        {
          org,
          username: user.username,
          password: user.password,
        },
        {
          headers: {
            'Authorization': `Bearer ${bearerToken}`,
          },
          httpsAgent,
          timeout: 10000,
        },
      );
      userCreated = true;

      // Create group with same name and ACL in description
      await axios.post(
        `https://localhost:${localPort}/api/groups`,
        {
          org,
          name: user.username,
          description: user.acl,
        },
        {
          headers: {
            'Authorization': `Bearer ${bearerToken}`,
          },
          httpsAgent,
          timeout: 10000,
        },
      );
      groupCreated = true;

      // Add user to the group
      await axios.post(
        `https://localhost:${localPort}/api/groups/${encodeURIComponent(org)}/${encodeURIComponent(user.username)}/members`,
        {
          username: user.username,
        },
        {
          headers: {
            'Authorization': `Bearer ${bearerToken}`,
          },
          httpsAgent,
          timeout: 10000,
        },
      );
    } catch (error) {
      const sanitizedError = this._sanitizeError(error, 'createUser');
      this._options.logger.error(
        { error: sanitizedError, localPort, org, username: user.username, userCreated, groupCreated },
        'Error creating LDAP user, attempting rollback',
      );

      // Rollback: delete group if created
      if (groupCreated) {
        try {
          await axios.delete(
            `https://localhost:${localPort}/api/groups/${encodeURIComponent(org)}/${encodeURIComponent(user.username)}`,
            {
              headers: {
                'Authorization': `Bearer ${bearerToken}`,
              },
              httpsAgent,
              timeout: 10000,
            },
          );
          this._options.logger.info({ username: user.username }, 'Rolled back: deleted group');
        } catch (rollbackError) {
          const sanitizedRollbackError = this._sanitizeError(rollbackError, 'rollbackGroupCreation');
          this._options.logger.error(
            { error: sanitizedRollbackError, username: user.username },
            'Failed to rollback group creation',
          );
        }
      }

      // Rollback: delete user if created
      if (userCreated) {
        try {
          await axios.delete(
            `https://localhost:${localPort}/api/users/${encodeURIComponent(org)}/${encodeURIComponent(user.username)}`,
            {
              headers: {
                'Authorization': `Bearer ${bearerToken}`,
              },
              httpsAgent,
              timeout: 10000,
            },
          );
          this._options.logger.info({ username: user.username }, 'Rolled back: deleted user');
        } catch (rollbackError) {
          const sanitizedRollbackError = this._sanitizeError(rollbackError, 'rollbackUserCreation');
          this._options.logger.error(
            { error: sanitizedRollbackError, username: user.username },
            'Failed to rollback user creation',
          );
        }
      }

      throw new Error('Failed to create user in LDAP server');
    }
  }

  async modifyUser(localPort: number, org: string, bearerToken: string, caCert: string, username: string, user: ModifyUserRequest): Promise<void> {
    assert(localPort, 'LdapRepository: Local port is required');
    assert(org, 'LdapRepository: Organization is required');
    assert(bearerToken, 'LdapRepository: Bearer token is required');
    assert(caCert, 'LdapRepository: CA certificate is required');
    assert(username, 'LdapRepository: Username is required');

    this._options.logger.info({ localPort, org, username }, 'Modifying LDAP user');

    const httpsAgent = new https.Agent({
      ca: caCert,
    });

    try {
      // Update user password if provided
      if (user.password) {
        await axios.put(
          `https://localhost:${localPort}/api/users/${encodeURIComponent(org)}/${encodeURIComponent(username)}`,
          {
            password: user.password,
          },
          {
            headers: {
              'Authorization': `Bearer ${bearerToken}`,
            },
            httpsAgent,
            timeout: 10000,
          },
        );
      }

      // Update group description (ACL) if provided
      if (user.acl) {
        await axios.put(
          `https://localhost:${localPort}/api/groups/${encodeURIComponent(org)}/${encodeURIComponent(username)}`,
          {
            description: user.acl,
          },
          {
            headers: {
              'Authorization': `Bearer ${bearerToken}`,
            },
            httpsAgent,
            timeout: 10000,
          },
        );
      }
    } catch (error) {
      const sanitizedError = this._sanitizeError(error, 'modifyUser');
      this._options.logger.error({ error: sanitizedError, localPort, org, username }, 'Error modifying LDAP user');
      throw new Error('Failed to modify user in LDAP server');
    }
  }

  async deleteUser(localPort: number, org: string, bearerToken: string, caCert: string, username: string): Promise<void> {
    assert(localPort, 'LdapRepository: Local port is required');
    assert(org, 'LdapRepository: Organization is required');
    assert(bearerToken, 'LdapRepository: Bearer token is required');
    assert(caCert, 'LdapRepository: CA certificate is required');
    assert(username, 'LdapRepository: Username is required');

    this._options.logger.info({ localPort, org, username }, 'Deleting LDAP user and group');

    const httpsAgent = new https.Agent({
      ca: caCert,
    });

    try {
      // Delete user
      await axios.delete(`https://localhost:${localPort}/api/users/${encodeURIComponent(org)}/${encodeURIComponent(username)}`, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
        },
        httpsAgent,
        timeout: 10000,
      });

      // Delete associated group
      await axios.delete(`https://localhost:${localPort}/api/groups/${encodeURIComponent(org)}/${encodeURIComponent(username)}`, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
        },
        httpsAgent,
        timeout: 10000,
      });
    } catch (error) {
      const sanitizedError = this._sanitizeError(error, 'deleteUser');
      this._options.logger.error({ error: sanitizedError, localPort, org, username }, 'Error deleting LDAP user');
      throw new Error('Failed to delete user from LDAP server');
    }
  }
}
