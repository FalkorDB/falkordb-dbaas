import axios from 'axios';
import assert from 'assert';
import { FastifyBaseLogger } from 'fastify';
import * as https from 'https';
import { ILdapRepository, LdapUser, CreateUserRequest, ModifyUserRequest } from './ILdapRepository';
import { LDAP_SERVICE_NAME } from '../../constants';

export class LdapRepository implements ILdapRepository {
  constructor(private _options: { logger: FastifyBaseLogger }) {}

  private _getPortForwardBaseUrl(localPort: number): string {
    return `https://localhost:${localPort}`;
  }

  private _createPortForwardHttpsAgent(options: { ca?: string }): https.Agent {
    return new https.Agent({
      ca: options.ca,
      rejectUnauthorized: false,
      checkServerIdentity: (_hostname: string, _cert: any) => undefined,
    });
  }

  private _extractCertificatePem(responseData: unknown): string {
    if (typeof responseData === 'string') {
      return responseData.trim();
    }

    if (responseData && typeof responseData === 'object') {
      const anyData = responseData as any;

      // Common patterns: { data: "...pem..." } or { data: { ... } }
      const direct = anyData.data;
      if (typeof direct === 'string') {
        return direct.trim();
      }

      const nested = anyData.data?.data;
      if (typeof nested === 'string') {
        return nested.trim();
      }

      // Fallback for possible alternate keys
      const candidates = [
        anyData.caCert,
        anyData.ca_certificate,
        anyData.certificate,
        anyData.cert,
        anyData.data?.caCert,
        anyData.data?.ca_certificate,
        anyData.data?.certificate,
        anyData.data?.cert,
      ];
      const found = candidates.find((c) => typeof c === 'string');
      if (typeof found === 'string') {
        return found.trim();
      }
    }

    throw new Error('Unexpected CA certificate response format');
  }

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

  async getCaCertificate(localPort: number, bearerToken: string): Promise<string> {
    assert(localPort, 'LdapRepository: Local port is required');

    this._options.logger.info({ localPort }, 'Getting LDAP CA certificate');

    const httpsAgent = this._createPortForwardHttpsAgent({});

    try {
      const response = await axios.get(`${this._getPortForwardBaseUrl(localPort)}/api/v1/ca-certificate`, {
        httpsAgent,
        timeout: 10000,
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      });

      const pem = this._extractCertificatePem(response.data);
      return pem;
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

    const httpsAgent = this._createPortForwardHttpsAgent({ ca: caCert });

    try {
      // Get users
      const usersResponse = await axios.get(
        `${this._getPortForwardBaseUrl(localPort)}/api/users/${encodeURIComponent(org)}`,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
          httpsAgent,
          timeout: 10000,
        },
      );

      const users = usersResponse.data.data.users || [];

      // Get all groups to retrieve ACL from descriptions
      const groupsResponse = await axios.get(
        `${this._getPortForwardBaseUrl(localPort)}/api/groups/${encodeURIComponent(org)}`,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
          httpsAgent,
          timeout: 10000,
        },
      );

      const groups = groupsResponse.data.data.groups || [];

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

  async createUser(
    localPort: number,
    org: string,
    bearerToken: string,
    caCert: string,
    user: CreateUserRequest,
  ): Promise<void> {
    assert(localPort, 'LdapRepository: Local port is required');
    assert(org, 'LdapRepository: Organization is required');
    assert(bearerToken, 'LdapRepository: Bearer token is required');
    assert(caCert, 'LdapRepository: CA certificate is required');
    assert(user.username, 'LdapRepository: Username is required');
    assert(user.password, 'LdapRepository: Password is required');
    assert(user.acl, 'LdapRepository: ACL is required');

    this._options.logger.info({ localPort, org, username: user.username }, 'Creating LDAP user and group');

    const httpsAgent = this._createPortForwardHttpsAgent({ ca: caCert });

    let userCreated = false;
    let groupCreated = false;

    try {
      // Create user
      await axios.post(
        `${this._getPortForwardBaseUrl(localPort)}/api/users`,
        {
          organization: org,
          username: user.username,
          password: user.password,
        },
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
          httpsAgent,
          timeout: 10000,
        },
      );
      userCreated = true;

      // Create group with same name and ACL in description
      await axios.post(
        `${this._getPortForwardBaseUrl(localPort)}/api/groups`,
        {
          organization: org,
          name: user.username,
          description: user.acl,
        },
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
          httpsAgent,
          timeout: 10000,
        },
      );
      groupCreated = true;

      // Add user to the group
      await axios.post(
        `${this._getPortForwardBaseUrl(localPort)}/api/groups/${encodeURIComponent(org)}/${encodeURIComponent(user.username)}/members`,
        {
          username: user.username,
        },
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
          httpsAgent,
          timeout: 10000,
        },
      );
    } catch (error) {
      const sanitizedError = this._sanitizeError(error, 'createUser');
      this._options.logger.error(
        { error: sanitizedError, localPort, org, username: user.username, userCreated, groupCreated },
        'Error creating LDAP user',
      );

      throw new Error('Failed to create user in LDAP server');
    }
  }

  async modifyUser(
    localPort: number,
    org: string,
    bearerToken: string,
    caCert: string,
    username: string,
    user: ModifyUserRequest,
  ): Promise<void> {
    assert(localPort, 'LdapRepository: Local port is required');
    assert(org, 'LdapRepository: Organization is required');
    assert(bearerToken, 'LdapRepository: Bearer token is required');
    assert(caCert, 'LdapRepository: CA certificate is required');
    assert(username, 'LdapRepository: Username is required');

    this._options.logger.info({ localPort, org, username }, 'Modifying LDAP user');

    const httpsAgent = this._createPortForwardHttpsAgent({ ca: caCert });

    try {
      // Update user password if provided
      if (user.password) {
        await axios.put(
          `${this._getPortForwardBaseUrl(localPort)}/api/users/${encodeURIComponent(org)}/${encodeURIComponent(username)}`,
          {
            password: user.password,
          },
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
            },
            httpsAgent,
            timeout: 10000,
          },
        );
      }

      // Update group description (ACL) if provided
      if (user.acl) {
        await axios.put(
          `${this._getPortForwardBaseUrl(localPort)}/api/groups/${encodeURIComponent(org)}/${encodeURIComponent(username)}`,
          {
            description: user.acl,
          },
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
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

  async deleteUser(
    localPort: number,
    org: string,
    bearerToken: string,
    caCert: string,
    username: string,
  ): Promise<void> {
    assert(localPort, 'LdapRepository: Local port is required');
    assert(org, 'LdapRepository: Organization is required');
    assert(bearerToken, 'LdapRepository: Bearer token is required');
    assert(caCert, 'LdapRepository: CA certificate is required');
    assert(username, 'LdapRepository: Username is required');

    this._options.logger.info({ localPort, org, username }, 'Deleting LDAP user and group');

    const httpsAgent = this._createPortForwardHttpsAgent({ ca: caCert });

    try {
      // Delete user
      await axios.delete(
        `${this._getPortForwardBaseUrl(localPort)}/api/users/${encodeURIComponent(org)}/${encodeURIComponent(username)}`,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
          httpsAgent,
          timeout: 10000,
        },
      );

      // Delete associated group
      await axios.delete(
        `${this._getPortForwardBaseUrl(localPort)}/api/groups/${encodeURIComponent(org)}/${encodeURIComponent(username)}`,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
          httpsAgent,
          timeout: 10000,
        },
      );
    } catch (error) {
      const sanitizedError = this._sanitizeError(error, 'deleteUser');
      this._options.logger.error({ error: sanitizedError, localPort, org, username }, 'Error deleting LDAP user');
      throw new Error('Failed to delete user from LDAP server');
    }
  }

  async checkHealth(localPort: number): Promise<{ status: 'healthy' | 'unhealthy' }> {
    assert(localPort, 'LdapRepository: Local port is required');

    this._options.logger.info({ localPort }, 'Checking LDAP server health');

    const httpsAgent = this._createPortForwardHttpsAgent({});

    try {
      const response = await axios.get(`${this._getPortForwardBaseUrl(localPort)}/health`, {
        httpsAgent,
        timeout: 10000,
      });

      return response.data.data;
    } catch (error) {
      const sanitizedError = this._sanitizeError(error, 'checkHealth');
      this._options.logger.error({ error: sanitizedError, localPort }, 'Error checking LDAP server health');
      throw new Error('Failed to check health of LDAP server');
    }
  }
}
