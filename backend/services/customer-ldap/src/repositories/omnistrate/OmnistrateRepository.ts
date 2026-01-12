/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, InternalAxiosRequestConfig, isAxiosError } from 'axios';
import { createDecoder } from 'fast-jwt';
import assert from 'assert';
import { FastifyBaseLogger } from 'fastify';
import { IOmnistrateRepository, OmnistrateInstance, SubscriptionUser } from './IOmnistrateRepository';

export class OmnistrateRepository implements IOmnistrateRepository {
  private static _client: AxiosInstance;
  private static _token: string | null = null;

  constructor(
    private _omnistrateUser: string,
    private _omnistratePassword: string,
    private _serviceId: string,
    private _environmentId: string,
    private _options: { logger: FastifyBaseLogger },
  ) {
    assert(_omnistrateUser, 'OmnistrateRepository: Omnistrate user is required');
    assert(_omnistratePassword, 'OmnistrateRepository: Omnistrate password is required');
    assert(_serviceId, 'OmnistrateRepository: Service ID is required');
    assert(_environmentId, 'OmnistrateRepository: Environment ID is required');

    if (!OmnistrateRepository._client) {
      OmnistrateRepository._client = axios.create({
        baseURL: 'https://api.omnistrate.cloud',
      });

      OmnistrateRepository._client.interceptors.request.use(this._getBearer(_omnistrateUser, _omnistratePassword));
    }
  }

  private _getBearer(
    user: string,
    password: string,
  ): (config: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig> {
    const decoder = createDecoder();
    return async (config: InternalAxiosRequestConfig) => {
      try {
        if (OmnistrateRepository._token) {
          const decoded = decoder(OmnistrateRepository._token) as any;
          if (decoded.exp && decoded.exp * 1000 > Date.now()) {
            config.headers.Authorization = `Bearer ${OmnistrateRepository._token}`;
            return config;
          }
        }
      } catch (_) {
        // Token decode failed, get a new one
      }

      let response;
      try {
        response = await axios.post('https://api.omnistrate.cloud/2022-09-01-00/signin', {
          email: user,
          password,
        });
      } catch (error) {
        throw new Error('Failed to authenticate with Omnistrate API');
      }

      OmnistrateRepository._token = response.data.jwtToken;
      config.headers.Authorization = `Bearer ${response.data.jwtToken}`;
      return config;
    };
  }

  async validate(token: string): Promise<boolean> {
    assert(token, 'OmnistrateRepository: Token is required');

    try {
      await axios.get('https://api.omnistrate.cloud/2022-09-01-00/user', {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

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

  async getInstance(instanceId: string): Promise<OmnistrateInstance> {
    assert(instanceId, 'OmnistrateRepository: Instance ID is required');

    this._options.logger.info({ instanceId }, 'Getting instance');

    let instance = null;
    try {
      instance = await OmnistrateRepository._client
        .get(
          `/2022-09-01-00/fleet/service/${this._serviceId}/environment/${this._environmentId}/instance/${instanceId}`,
        )
        .then((response) => response.data);
    } catch (error) {
      this._options.logger.error({ error }, 'Error getting instance');
      throw new Error('Error getting instance');
    }


    return {
      id: instance?.['consumptionResourceInstanceResult']?.['id'],
      clusterId: `${
        instance?.['cloudProvider'] === 'gcp'
          ? 'c-' + instance?.['deploymentCellID'].replace(/-/g, '')
          : instance?.['deploymentCellID']
      }`,
      region: instance?.['consumptionResourceInstanceResult']?.['region'],
      userId: instance?.['consumptionResourceInstanceResult']?.['createdByUserId'],
      createdDate: instance?.['consumptionResourceInstanceResult']?.['created_at'],
      serviceId: instance?.['serviceId'],
      environmentId: instance?.['environmentId'],
      productTierId: instance?.['productTierId'],
      status: instance?.['consumptionResourceInstanceResult']?.['status'],
      resourceId:
        Object.entries(instance?.['consumptionResourceInstanceResult']?.['detailedNetworkTopology'] ?? {}).filter(
          (ob) => (ob[1] as unknown)?.['main'],
        )?.[0]?.[0] ?? null,
      cloudProvider: instance?.['cloudProvider'],
      productTierName: instance?.['productTierName'],
      deploymentType:
        (
          Object.values(instance?.['consumptionResourceInstanceResult']?.['detailedNetworkTopology'] ?? {}).find(
            (ob) => (ob as any)?.main,
          ) as any
        )?.['resourceName'] ?? null,
      subscriptionId: instance?.['subscriptionId'],
      resultParams: instance?.['consumptionResourceInstanceResult']?.['result_params'] || {},
    } as OmnistrateInstance;
  }

  async getSubscriptionUsers(subscriptionId: string): Promise<SubscriptionUser[]> {
    assert(subscriptionId, 'OmnistrateRepository: Subscription ID is required');
    this._options.logger.info({ subscriptionId }, 'Getting subscription users');

    const response = await OmnistrateRepository._client.get(
      `/2022-09-01-00/fleet/service/${this._serviceId}/environment/${this._environmentId}/users?subscriptionId=${subscriptionId}`,
    );

    return (
      response.data['users']?.map((d: unknown) => ({
        userId: d?.['userId'],
        email: d?.['email'],
        role: d?.['userSubscriptionRole'],
      })) || []
    );
  }

  async checkIfUserHasAccessToInstance(
    userId: string,
    instanceId: string,
    minRole?: 'root' | 'writer' | 'reader',
  ): Promise<{ hasAccess: boolean; role?: 'root' | 'writer' | 'reader' }> {
    assert(instanceId, 'OmnistrateRepository: Instance ID is required');
    assert(userId, 'OmnistrateRepository: User ID is required');

    const instance = await this.getInstance(instanceId);

    this._options.logger.debug({ instance }, 'Checking if user has access to instance');

    const subscriptionUsers = await this.getSubscriptionUsers(instance.subscriptionId);
    const user = subscriptionUsers.find((u) => u.userId === userId);

    if (!user) {
      return { hasAccess: false };
    }

    const roleHierarchy = { root: 3, writer: 2, reader: 1 };
    const userRoleLevel = roleHierarchy[user.role];
    const minRoleLevel = minRole ? roleHierarchy[minRole] : 1;

    if (userRoleLevel >= minRoleLevel) {
      return { hasAccess: true, role: user.role };
    }

    return { hasAccess: false, role: user.role };
  }
}
