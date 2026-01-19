import { createSigner, createVerifier } from 'fast-jwt';
import * as assert from 'assert';
import { FastifyBaseLogger } from 'fastify';
import { ISessionRepository, SessionData } from './ISessionRepository';
import { SESSION_EXPIRY_SECONDS } from '../../constants';

export class SessionRepository implements ISessionRepository {
  protected readonly SESSION_EXPIRY = SESSION_EXPIRY_SECONDS;
  private _signer: (payload: Record<string, unknown>) => string;
  private readonly _verifier: (token: string) => Record<string, unknown>;

  constructor(
    private _jwtSecret: string,
    private _options: { logger: FastifyBaseLogger },
  ) {
    assert.ok(_jwtSecret, 'SessionRepository: JWT secret is required');
    
    // Initialize signer - will be recreated if SESSION_EXPIRY changes
    this._signer = this._createSigner();
    
    this._verifier = createVerifier({
      key: _jwtSecret,
    });
  }
  
  private _createSigner() {
    return createSigner({
      key: this._jwtSecret,
      expiresIn: `${this.SESSION_EXPIRY}s`, // fast-jwt uses string format like "15m" or seconds as "123s"
    });
  }

  createSession(data: SessionData): string {
    assert.ok(data.userId, 'SessionRepository: User ID is required');
    assert.ok(data.subscriptionId, 'SessionRepository: Subscription ID is required');
    assert.ok(data.instanceId, 'SessionRepository: Instance ID is required');
    assert.ok(data.cloudProvider, 'SessionRepository: Cloud provider is required');
    assert.ok(data.region, 'SessionRepository: Region is required');
    assert.ok(data.k8sClusterName, 'SessionRepository: K8s cluster name is required');
    assert.ok(data.role, 'SessionRepository: Role is required');

    this._options.logger.info(
      { userId: data.userId, instanceId: data.instanceId },
      'Creating session',
    );

    // Recreate signer to pick up any SESSION_EXPIRY changes (for testing)
    this._signer = this._createSigner();

    const token = this._signer({
      userId: data.userId,
      subscriptionId: data.subscriptionId,
      instanceId: data.instanceId,
      cloudProvider: data.cloudProvider,
      region: data.region,
      k8sClusterName: data.k8sClusterName,
      role: data.role,
    });

    return token;
  }

  validateSession(cookie: string): boolean {
    if (!cookie) {
      return false;
    }

    try {
      this._verifier(cookie);
      return true;
    } catch (error) {
      this._options.logger.debug({ error }, 'Invalid session cookie');
      return false;
    }
  }

  decodeSession(cookie: string): SessionData | null {
    if (!cookie) {
      return null;
    }

    try {
      const decoded = this._verifier(cookie);

      return {
        userId: decoded.userId as string,
        subscriptionId: decoded.subscriptionId as string,
        instanceId: decoded.instanceId as string,
        cloudProvider: decoded.cloudProvider as 'gcp' | 'aws' | 'azure',
        region: decoded.region as string,
        k8sClusterName: decoded.k8sClusterName as string,
        role: decoded.role as 'root' | 'writer' | 'reader',
      };
    } catch (error) {
      this._options.logger.debug({ error }, 'Error decoding session cookie');
      return null;
    }
  }
}
