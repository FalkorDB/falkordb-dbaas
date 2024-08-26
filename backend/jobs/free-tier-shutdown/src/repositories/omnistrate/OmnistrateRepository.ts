import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { OmnistrateInstanceSchemaType } from '../../schemas/OmnistrateInstance';
import { decode, JwtPayload } from 'jsonwebtoken';

export class OmnistrateRepository {
  private static _client: AxiosInstance;

  private static _token: string | null = null;

  constructor(_omnistrateUser: string, _omnistratePassword: string) {
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
    return async (config: InternalAxiosRequestConfig) => {
      try {
        if (
          OmnistrateRepository._token &&
          (decode(OmnistrateRepository._token) as JwtPayload).exp * 1000 < Date.now()
        ) {
          config.headers.Authorization = `Bearer ${OmnistrateRepository._token}`;
          return config;
        }
      } catch (_) {
        //
      }
      const response = await axios.post(
        '/auth',
        {},
        {
          auth: {
            username: user,
            password: password,
          },
        },
      );
      config.headers.Authorization = `Bearer ${response.data.token}`;
      return config;
    };
  }

  async getInstancesFromTier(serviceId: string, tierId: string): Promise<OmnistrateInstanceSchemaType[]> {
    return [];
  }

  async stopInstance(instance: OmnistrateInstanceSchemaType): Promise<void> {}
}
