/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { OmnistrateInstanceSchemaType } from '../../schemas/OmnistrateInstance';
import { decode, JwtPayload } from 'jsonwebtoken';
import assert = require('assert');
import { Logger } from 'pino';
export class OmnistrateRepository {
  private static _client: AxiosInstance;

  private static _token: string | null = null;

  constructor(
    _omnistrateUser: string,
    _omnistratePassword: string,
    private _options: { logger: Logger },
  ) {
    OmnistrateRepository._client = axios.create({
      baseURL: 'https://api.omnistrate.cloud',
    });
    assert(_omnistrateUser, 'OmnistrateRepository: Omnistrate user is required');
    assert(_omnistratePassword, 'OmnistrateRepository: Omnistrate password is required');
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
      const response = await axios.post('https://api.omnistrate.cloud/2022-09-01-00/signin', {
        email: user,
        password,
      });
      config.headers.Authorization = `Bearer ${response.data.jwtToken}`;
      return config;
    };
  }

  async getUser(userId: string): Promise<{ email: string; name: string }> {
    assert(userId, 'OmnistrateRepository: User ID is required');
    this._options.logger.info({ userId }, 'Getting user');
    const response = await OmnistrateRepository._client.get(`/2022-09-01-00/fleet/users`);

    const user = response.data['users']?.find((u: unknown) => u?.['userId'] === userId);

    if (!user) {
      throw new Error('User not found');
    }

    return {
      email: user?.['email'],
      name: user?.['userName'],
    };
  }

  async getInstancesFromTier(
    serviceId: string,
    environmentId: string,
    tierId: string,
  ): Promise<OmnistrateInstanceSchemaType[]> {
    assert(serviceId, 'OmnistrateRepository: Service ID is required');
    assert(environmentId, 'OmnistrateRepository: Environment ID is required');
    assert(tierId, 'OmnistrateRepository: Tier ID is required');

    this._options.logger.info({ serviceId, environmentId, tierId }, 'Getting instances from tier');

    const response = await OmnistrateRepository._client.get(
      `/2022-09-01-00/fleet/service/${serviceId}/environment/${environmentId}/instances`,
    );

    return response.data['resourceInstances']
      .map((d: unknown) => ({
        id: d?.['consumptionResourceInstanceResult']?.['id'],
        clusterId: d?.['deploymentCellID'],
        region: d?.['consumptionResourceInstanceResult']?.['region'],
        userId: d?.['consumptionResourceInstanceResult']?.['createdByUserId'],
        createdDate: d?.['consumptionResourceInstanceResult']?.['created_at'],
        serviceId: d?.['serviceId'],
        environmentId: d?.['environmentId'],
        productTierId: d?.['productTierId'],
        tls: d?.['consumptionResourceInstanceResult']?.['result_params']?.['enableTLS'] === 'true',
        status: d?.['consumptionResourceInstanceResult']?.['status'],
        resourceId: Object.entries(d?.['consumptionResourceInstanceResult']?.['detailedNetworkTopology']).filter(
          (ob) => (ob[1] as unknown)?.['main'],
        )[0][0],
        cloudProvider: d?.['consumptionResourceInstanceResult']?.['cloud_provider'],
      }))
      .filter(
        (instance) => instance.productTierId === tierId && instance.status === 'RUNNING',
      ) as OmnistrateInstanceSchemaType[];
  }

  async stopInstance(instance: OmnistrateInstanceSchemaType): Promise<void> {
    assert(instance, 'OmnistrateRepository: Instance is required');
    this._options.logger.info({ instanceId: instance.id }, 'Stopping instance');
    if (process.env.DRY_RUN === '1') {
      return;
    }
    await OmnistrateRepository._client.post(
      `/2022-09-01-00/fleet/service/${instance.serviceId}/environment/${instance.environmentId}/instance/${instance.id}/stop`,
      {
        resourceId: instance.resourceId,
      },
    );
  }
}
