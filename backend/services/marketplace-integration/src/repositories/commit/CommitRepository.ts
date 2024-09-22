import { FastifyBaseLogger } from 'fastify';
import { ICommitRepository } from './ICommitRepository';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import assert from 'assert';
import { decode, JwtPayload } from 'jsonwebtoken';
import { auth } from 'google-auth-library';

export class CommitRepository implements ICommitRepository {
  private static _client: AxiosInstance;
  private static _token: string | null = null;

  constructor(
    private _baseUrl: string,
    private _opts: {
      dryRun?: boolean;
      logger: FastifyBaseLogger;
    },
  ) {
    assert(_baseUrl, 'CommitRepository: Base URL is required');

    CommitRepository._client = axios.create({
      baseURL: _baseUrl,
      timeout: 5000,
    });
    CommitRepository._client.interceptors.request.use(CommitRepository._getBearerInterceptor());
  }

  static _getBearerInterceptor(): (config: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig> {
    // Return bearer from default service account
    return async (config: InternalAxiosRequestConfig) => {
      try {
        if (CommitRepository._token && (decode(CommitRepository._token) as JwtPayload).exp * 1000 < Date.now()) {
          config.headers.Authorization = `Bearer ${CommitRepository._token}`;
          return config;
        }
      } catch (_) {
        //
      }
      const client = await auth.getApplicationDefault();
      const { token } = await client.credential.getAccessToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    };
  }

  async verifyAccountCreated(accountId: string): Promise<void> {
    this._opts.logger.info({ accountId, dryRun: this._opts.dryRun }, 'Verifying account created');
    if (this._opts.dryRun) {
      return;
    }

    try {
      await CommitRepository._client.post('/onboardingComplete', { account_id: accountId });
    } catch (error) {
      this._opts.logger.error({ accountId, error }, 'Failed to verify account created');
      throw error;
    }
  }

  async verifyEntitlementCreated(accountId: string, entitlementId: string): Promise<void> {
    this._opts.logger.info({ accountId, entitlementId, dryRun: this._opts.dryRun }, 'Verifying entitlement created');
    if (this._opts.dryRun) {
      return;
    }

    try {
      await CommitRepository._client.post('/provisioningComplete', {
        account_id: accountId,
        entitlement_id: entitlementId,
      });
    } catch (error) {
      this._opts.logger.error({ accountId, entitlementId, error }, 'Failed to verify entitlement created');
      throw error;
    }
  }

  async verifyEntitlementDeleted(accountId: string, entitlementId: string): Promise<void> {
    this._opts.logger.info({ accountId, entitlementId, dryRun: this._opts.dryRun }, 'Verifying entitlement deleted');
    if (this._opts.dryRun) {
      return;
    }

    try {
      await CommitRepository._client.post('/cancelationComplete', {
        account_id: accountId,
        entitlement_id: entitlementId,
      });
    } catch (error) {
      this._opts.logger.error({ accountId, entitlementId, error }, 'Failed to verify entitlement deleted');
      throw error;
    }
  }
}
