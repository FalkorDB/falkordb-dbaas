import { ApiError } from '@falkordb/errors';
import { IAuthRepository, SignUpResponse } from './IAuthRepository';
import { GoogleAuth, AuthClient } from 'google-auth-library';
import { FastifyBaseLogger } from 'fastify';
import { GaxiosError } from 'gaxios';

export class AuthRepositoryIdentityPlatform implements IAuthRepository {
  private _client: AuthClient;
  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
  ) {
    this._getClient();
  }

  private async _getClient() {
    if (!this._client) {
      const auth = new GoogleAuth({
        scopes: 'https://www.googleapis.com/auth/cloud-platform',
      });
      this._client = await auth.getClient();
    }

    return this._client;
  }

  private _handleError(error: Error) {
    if (error instanceof GaxiosError && error.response?.status === 400) {
      if (error.response.data.error.message === 'EMAIL_EXISTS') {
        throw ApiError.conflict('Email exists', 'AUTH_EMAIL_EXISTS');
      }

      if (error.response.data.error.message === 'INVALID_EMAIL') {
        throw ApiError.badRequest('Invalid email', 'AUTH_INVALID_EMAIL');
      }

      if (error.response.data.error.message === 'WEAK_PASSWORD') {
        throw ApiError.badRequest('Weak password', 'AUTH_WEAK_PASSWORD');
      }

      if (error.response.data.error.message === 'EMAIL_NOT_FOUND') {
        throw ApiError.notFound('Email not found', 'AUTH_EMAIL_NOT_FOUND');
      }

      if (error.response.data.error.message === 'INVALID_PASSWORD') {
        throw ApiError.unauthorized('Invalid password', 'AUTH_INVALID_PASSWORD');
      }

      if (error.response.data.error.message === 'USER_DISABLED') {
        throw ApiError.forbidden('User disabled', 'AUTH_USER_DISABLED');
      }

      throw ApiError.badRequest('Error', error.response.data.error.message);
    }

    throw error;
  }

  async signup(email: string, password: string): Promise<SignUpResponse> {
    try {
      const response = await this._call<{
        email: string;
        localId: string;
      }>('https://identitytoolkit.googleapis.com/v1/accounts:signUp', {
        email,
        password,
        returnSecureToken: true,
      });
      console.log(response);

      return this.loginWithEmail(email, password);
    } catch (error) {
      this._handleError(error);
    }
  }

  async loginWithEmail(email: string, password: string): Promise<SignUpResponse> {
    try {
      const response = await this._call<{
        email: string;
        idToken: string;
        expiresIn: number;
        refreshToken: string;
        localId: string;
      }>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword', {
        email,
        password,
        returnSecureToken: true,
      });

      return {
        email: response.email,
        token: response.idToken,
        expiresIn: response.expiresIn,
        refreshToken: response.refreshToken,
        uid: response.localId,
      };
    } catch (error) {
      this._handleError(error);
    }
  }

  async _call<T>(url: string, body: object): Promise<T> {
    const client = await this._getClient();
    const response = await client.request({
      url,
      method: 'POST',
      data: body,
    });
    return response.data as T;
  }
}
