import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { OmnistrateInstanceSchemaType } from '../../schemas/OmnistrateInstance';

export class OmnistrateRepository {
  private static _client: AxiosInstance;

  constructor(
    _omnistrateUser: string,
    _omnistratePassword: string,
  ) {
    OmnistrateRepository._client = axios.create({
      baseURL: 'https://omnistrate.com/api',
    });
    OmnistrateRepository._client.interceptors.request.use(
      OmnistrateRepository._getBearer(_omnistrateUser, _omnistratePassword),
    );
  }

  static _getBearer(
    user: string,
    password: string,
  ): (config: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig> {
    return (config: InternalAxiosRequestConfig) =>
      this._client
        .post(
          '/auth',
          {},
          {
            auth: {
              username: user,
              password: password,
            },
          },
        )
        .then((response) => {
          config.headers.Authorization = `Bearer ${response.data.token}`;
          return config;
        });
  }

  async getInstancesFromTier(serviceId: string, tierId: string): Promise<OmnistrateInstanceSchemaType[]> {
    return [];
  }

  async stopInstance(instance: OmnistrateInstanceSchemaType): Promise<void> {}
}
