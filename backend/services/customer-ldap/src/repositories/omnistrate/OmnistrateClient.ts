import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { createDecoder } from 'fast-jwt';
import assert from 'assert';
import { FastifyBaseLogger } from 'fastify';
import { ApiError } from '@falkordb/errors';

export class OmnistrateClient {
  private _client: AxiosInstance;
  private _token: string | null = null;

  constructor(
    private _omnistrateUser: string,
    private _omnistratePassword: string,
    private _options: { logger: FastifyBaseLogger },
  ) {
    assert(_omnistrateUser, 'OmnistrateClient: Omnistrate user is required');
    assert(_omnistratePassword, 'OmnistrateClient: Omnistrate password is required');

    this._client = axios.create({
      baseURL: 'https://api.omnistrate.cloud',
    });

    this._client.interceptors.request.use(this._getBearer());
  }

  private _getBearer(): (config: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig> {
    const decoder = createDecoder();
    return async (config: InternalAxiosRequestConfig) => {
      try {
        if (this._token) {
          const decoded = decoder(this._token) as { exp?: number };
          if (decoded.exp && decoded.exp * 1000 > Date.now()) {
            config.headers.Authorization = `Bearer ${this._token}`;
            return config;
          }
        }
      } catch (_) {
        // Token decode failed, get a new one
      }

      let response;
      try {
        response = await axios.post('https://api.omnistrate.cloud/2022-09-01-00/signin', {
          email: this._omnistrateUser,
          password: this._omnistratePassword,
        });
      } catch (error) {
        throw ApiError.unauthorized('Failed to authenticate with Omnistrate API', 'OMNISTRATE_AUTH_FAILED');
      }

      this._token = response.data.jwtToken;
      config.headers.Authorization = `Bearer ${response.data.jwtToken}`;
      return config;
    };
  }

  get client(): AxiosInstance {
    return this._client;
  }
}

export const IOmnistrateClient = {
  repositoryName: 'IOmnistrateClient',
};
