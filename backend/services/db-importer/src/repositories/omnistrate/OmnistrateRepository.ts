/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, InternalAxiosRequestConfig, isAxiosError } from 'axios';
import { OmnistrateInstanceSchemaType } from '../../schemas/omnistrate-instance';
import { decode, JwtPayload } from 'jsonwebtoken';
import assert = require('assert');
import { FastifyBaseLogger } from 'fastify';

export class OmnistrateRepository {
  private static _client: AxiosInstance;

  private static _token: string | null = null;

  constructor(
    _omnistrateUser: string,
    _omnistratePassword: string,
    private _serviceId: string,
    private _environmentId: string,
    private _options: { logger: FastifyBaseLogger },
  ) {
    OmnistrateRepository._client = axios.create({
      baseURL: 'https://api.omnistrate.cloud',
    });
    assert(_omnistrateUser, 'OmnistrateRepository: Omnistrate user is required');
    assert(_omnistratePassword, 'OmnistrateRepository: Omnistrate password is required');
    assert(_serviceId, 'OmnistrateRepository: Service ID is required');
    assert(_environmentId, 'OmnistrateRepository: Environment ID is required');
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

  async validate(token: string): Promise<boolean> {
    assert(token, 'OmnistrateRepository: Token is required');

    try {

      const response = await axios.get(
        `https://api.omnistrate.cloud/2022-09-01-00/user`,
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      return true;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        this._options.logger.error({ error }, 'Invalid token');
      } else {
        this._options.logger.error({ error }, 'Error validating token');
      }
      return false;
    }
  }

  async getInstance(
    instanceId: string,
  ): Promise<OmnistrateInstanceSchemaType> {
    assert(instanceId, 'OmnistrateRepository: Instance ID is required');

    this._options.logger.info({ instanceId }, 'Getting instance');

    let instance = null;
    try {
      instance = await OmnistrateRepository._client.get(
        `/2022-09-01-00/fleet/service/${this._serviceId}/environment/${this._environmentId}/instance/${instanceId}`,
      ).then(response => response.data)
    } catch (error) {
      this._options.logger.error({ error }, 'Error getting instance');
      throw new Error('Error getting instance');
    }

    if (!instance) {
      throw new Error('Instance not found');
    }

    return {
      id: instance?.['consumptionResourceInstanceResult']?.['id'],
      clusterId: `${instance?.['cloudProvider'] === 'gcp' ? 'c-' + instance?.['deploymentCellID'].replace(/-/g, '') : instance?.['deploymentCellID']}`,
      region: instance?.['consumptionResourceInstanceResult']?.['region'],
      userId: instance?.['consumptionResourceInstanceResult']?.['createdByUserId'],
      createdDate: instance?.['consumptionResourceInstanceResult']?.['created_at'],
      serviceId: instance?.['serviceId'],
      environmentId: instance?.['environmentId'],
      productTierId: instance?.['productTierId'],
      tls: instance?.['consumptionResourceInstanceResult']?.['result_params']?.['enableTLS'] === 'true',
      status: instance?.['consumptionResourceInstanceResult']?.['status'],
      resourceId: Object.entries(
        instance?.['consumptionResourceInstanceResult']?.['detailedNetworkTopology'],
      ).filter((ob) => (ob[1] as unknown)?.['main'])[0][0],
      cloudProvider: instance?.['cloudProvider'],
      productTierName: instance?.['productTierName'],
      deploymentType: Object.values(instance?.['consumptionResourceInstanceResult']?.['detailedNetworkTopology']).find(
        ob => (ob as any).main
      )['resourceName'],
      subscriptionId: instance?.['subscriptionId'],
      aofEnabled: instance?.['consumptionResourceInstanceResult']?.['result_params']?.['AOFPersistenceConfig'] !== 'no',
      podIds: Object.values(instance?.['consumptionResourceInstanceResult']?.['detailedNetworkTopology']).find(
        ob => (ob as any).hasCompute && !(ob as any).resourceKey?.includes('rebalance') && !(ob as any).resourceKey?.includes('sentinel')
      )['nodes']?.map((node: any) => node['id']) ?? [],
    } as OmnistrateInstanceSchemaType

  }

  async getSubscriptionUsers(
    subscriptionId: string,
  ): Promise<{ userId: string; email: string; role: 'root' | 'writer' | 'reader' }[]> {
    assert(subscriptionId, 'OmnistrateRepository: Subscription ID is required');
    this._options.logger.info({ subscriptionId }, 'Getting subscription users');

    const response = await OmnistrateRepository._client.get(
      `/2022-09-01-00/fleet/service/${this._serviceId}/environment/${this._environmentId}/users?subscriptionId=${subscriptionId}`,
    );

    return response.data['users']?.map((d: unknown) => ({
      userId: d?.['userId'],
      email: d?.['email'],
      role: d?.['userSubscriptionRole'],
    })) as { userId: string; email: string; role: 'root' | 'writer' | 'reader' }[];
  }

  async checkIfUserHasAccessToInstance(
    userId: string,
    instance?: OmnistrateInstanceSchemaType,
    instanceId?: string,
  ): Promise<boolean> {
    assert(instance || instanceId, 'OmnistrateRepository: Instance or Instance ID is required');
    assert(userId, 'OmnistrateRepository: User ID is required');

    instance = instance || (await this.getInstance(instanceId as string));
    if (!instance) {
      return false;
    }

    this._options.logger.debug({ instance }, 'Checking if user has write access to instance');

    const subscriptionUsers = await this.getSubscriptionUsers(
      instance.subscriptionId,
    );
    const user = subscriptionUsers.find((u) => u.userId === userId);

    if (!user) {
      return false;
    }

    if (['root', 'writer', 'reader'].includes(user.role)) {
      return true;
    }

    return false;
  }

}
