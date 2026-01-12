import { FastifyBaseLogger } from 'fastify';
import { ILdapRepository, LdapUser, CreateUserRequest, ModifyUserRequest } from '../repositories/ldap/ILdapRepository';
import { validateAcl } from '../utils/acl-validator';

export interface LdapServiceOptions {
  logger: FastifyBaseLogger;
  localPort: number;
  org: string;
  bearerToken: string;
  caCert: string;
}

export class LdapService {
  private _localPort: number;
  private _org: string;
  private _bearerToken: string;
  private _caCert: string;

  constructor(
    private _options: LdapServiceOptions,
    private _ldapRepository: ILdapRepository,
  ) {
    this._localPort = _options.localPort;
    this._org = _options.org;
    this._bearerToken = _options.bearerToken;
    this._caCert = _options.caCert;
  }

  async listUsers(): Promise<LdapUser[]> {
    return this._ldapRepository.listUsers(
      this._localPort,
      this._org,
      this._bearerToken,
      this._caCert,
    );
  }

  async createUser(user: CreateUserRequest): Promise<void> {
    // Validate ACL
    const validation = validateAcl(user.acl);
    if (!validation.valid) {
      throw new Error(
        `Invalid ACL: The following commands are not allowed: ${validation.invalidCommands.join(', ')}`,
      );
    }

    return this._ldapRepository.createUser(
      this._localPort,
      this._org,
      this._bearerToken,
      this._caCert,
      user,
    );
  }

  async modifyUser(username: string, user: ModifyUserRequest): Promise<void> {
    // Validate ACL if provided
    if (user.acl) {
      const validation = validateAcl(user.acl);
      if (!validation.valid) {
        throw new Error(
          `Invalid ACL: The following commands are not allowed: ${validation.invalidCommands.join(', ')}`,
        );
      }
    }

    return this._ldapRepository.modifyUser(
      this._localPort,
      this._org,
      this._bearerToken,
      this._caCert,
      username,
      user,
    );
  }

  async deleteUser(username: string): Promise<void> {
    return this._ldapRepository.deleteUser(
      this._localPort,
      this._org,
      this._bearerToken,
      this._caCert,
      username,
    );
  }
}
