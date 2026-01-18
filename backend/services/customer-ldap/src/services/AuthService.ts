import { FastifyBaseLogger } from 'fastify';
import { IOmnistrateRepository } from '../repositories/omnistrate/IOmnistrateRepository';
import { ISessionRepository, SessionData } from '../repositories/session/ISessionRepository';
import * as assert from 'assert';
import { ApiError } from '@falkordb/errors';

export interface AuthServiceOptions {
  logger: FastifyBaseLogger;
}

export class AuthService {
  constructor(
    private _options: AuthServiceOptions,
    private _omnistrateRepository: IOmnistrateRepository,
    private _sessionRepository: ISessionRepository,
  ) {}

  async authenticateAndAuthorize(
    token: string,
    instanceId: string,
    subscriptionId: string,
    minRole: 'root' | 'writer' | 'reader' = 'reader',
  ): Promise<{ session: string; sessionData: SessionData }> {
    assert.ok(token, 'AuthService: Token is required');
    assert.ok(instanceId, 'AuthService: Instance ID is required');
    assert.ok(subscriptionId, 'AuthService: Subscription ID is required');

    this._options.logger.info({ instanceId, subscriptionId }, 'Authenticating user');

    // Step 1: Validate the Omnistrate token
    const isValidToken = await this._omnistrateRepository.validate(token);
    if (!isValidToken) {
      throw ApiError.unauthorized('Invalid Omnistrate token', 'INVALID_OMNISTRATE_TOKEN');
    }

    // Step 2: Get user ID from token (decode without verification since we already validated)
    const tokenPayload = this._decodeToken(token);
    const userId = (tokenPayload.userID || tokenPayload.user_id || tokenPayload.sub) as string;

    if (!userId) {
      throw ApiError.unauthorized('User ID not found in token', 'USER_ID_NOT_FOUND_IN_TOKEN');
    }

    // Step 3: Check if user has access to the instance
    const { hasAccess, role } = await this._omnistrateRepository.checkIfUserHasAccessToInstance(
      userId,
      instanceId,
      minRole,
    );

    if (!hasAccess) {
      throw ApiError.forbidden('User does not have access to this instance', 'NO_INSTANCE_ACCESS');
    }

    if (!role) {
      throw ApiError.forbidden('User role not found for instance access', 'USER_ROLE_NOT_FOUND');
    }

    // Step 4: Get instance details
    const instance = await this._omnistrateRepository.getInstance(instanceId);

    // Step 5: Validate subscription ID matches
    if (instance.subscriptionId !== subscriptionId) {
      throw ApiError.badRequest('Subscription ID does not match instance', 'SUBSCRIPTION_MISMATCH');
    }

    // Step 6: Create session cookie
    const sessionData: SessionData = {
      userId,
      subscriptionId,
      instanceId,
      cloudProvider: instance.cloudProvider,
      region: instance.region,
      k8sClusterName: instance.clusterId,
      role: role,
    };

    const session = this._sessionRepository.createSession(sessionData);

    this._options.logger.info({ userId, instanceId, role }, 'User authenticated successfully');

    return { session, sessionData };
  }

  validateSession(cookie: string): boolean {
    return this._sessionRepository.validateSession(cookie);
  }

  decodeSession(cookie: string): SessionData | null {
    return this._sessionRepository.decodeSession(cookie);
  }

  static checkPermission(role: 'root' | 'writer' | 'reader', requiredRole: 'writer' | 'reader'): boolean {
    const roleHierarchy = { root: 3, writer: 2, reader: 1 };
    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  }

  private _decodeToken(token: string): Record<string, unknown> {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        Buffer.from(base64, 'base64')
          .toString()
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload) as Record<string, unknown>;
    } catch (error) {
      this._options.logger.error({ error }, 'Error decoding token');
      throw ApiError.unauthorized('Invalid token format', 'INVALID_TOKEN_FORMAT');
    }
  }
}
