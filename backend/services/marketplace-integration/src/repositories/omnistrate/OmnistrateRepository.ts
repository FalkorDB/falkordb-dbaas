import { IOmnistrateRepository } from './IOmnistrateRepository';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { JwtPayload, decode } from 'jsonwebtoken';
import assert = require('assert');
import { randomBytes } from 'crypto';
import { FastifyBaseLogger } from 'fastify';

export class OmnistrateRepository implements IOmnistrateRepository {
  private static _client: AxiosInstance;

  private static _token: string | null = null;

  private static _baseUrl: string = 'https://api.omnistrate.cloud';

  constructor(
    _omnistrateUser: string,
    _omnistratePassword: string,
    private _serviceId: string,
    private _environmentId: string,
    private _freeProductTierId: string,
    private _createFreeInstancePath: string,
    private _serviceAccountSecret: string,
    private _opts: {
      dryRun?: boolean;
      logger: FastifyBaseLogger;
    },
  ) {
    OmnistrateRepository._client = axios.create({
      baseURL: OmnistrateRepository._baseUrl,
    });
    assert(_omnistrateUser, 'OmnistrateRepository: Omnistrate user is required');
    assert(_omnistratePassword, 'OmnistrateRepository: Omnistrate password is required');
    assert(_serviceId, 'OmnistrateRepository: Service ID is required');
    assert(_environmentId, 'OmnistrateRepository: Environment ID is required');
    assert(_freeProductTierId, 'OmnistrateRepository: Free Product Tier ID is required');
    assert(_createFreeInstancePath, 'OmnistrateRepository: Create Free Instance Path is required');
    assert(_serviceAccountSecret, 'OmnistrateRepository: Service Account Secret is required');
    OmnistrateRepository._client.interceptors.request.use(
      OmnistrateRepository._getBearerInterceptor(_omnistrateUser, _omnistratePassword),
    );
  }

  private _getSAEmail(id: string): string {
    return `omnistrate-sa+${id}@falkordb.com`;
  }

  static _getBearerInterceptor(
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
      const bearer = await OmnistrateRepository._getBearer(user, password);
      config.headers.Authorization = `Bearer ${bearer}`;
      return config;
    };
  }

  static async _getBearer(email: string, password: string): Promise<string> {
    const response = await axios.post(`${OmnistrateRepository._baseUrl}/2022-09-01-00/signin`, {
      email,
      password,
    });
    return response.data.jwtToken;
  }

  static async _getCustomerBearer(email: string, password: string) {
    const response = await OmnistrateRepository._client.post(`/2022-09-01-00/customer-user-signin`, {
      email,
      password,
    });

    return response.data.jwtToken;
  }

  private async _createServiceAccount(id: string): Promise<{ email: string; password: string }> {
    this._opts.logger.info({ id, dryRun: this._opts.dryRun }, 'Creating service account');

    if (this._opts?.dryRun) {
      return { email: this._getSAEmail(id), password: this._serviceAccountSecret };
    }

    const email = this._getSAEmail(id);
    await OmnistrateRepository._client.post(`/2022-09-01-00/customer-user-signup`, {
      email,
      legalCompanyName: 'FalkorDB SA',
      name: `FalkorDB Service Account ${id.replace(/-/g, '')}`,
      password: this._serviceAccountSecret,
    });
    return { email, password: this._serviceAccountSecret };
  }

  private async _getUser(email: string): Promise<{ userId: string; token?: string }> {
    this._opts.logger.info({ email, dryRun: this._opts.dryRun }, 'Getting user');

    if (this._opts?.dryRun) {
      return { userId: '123', token: '123' };
    }

    const response = await OmnistrateRepository._client.get(`/2022-09-01-00/fleet/users`);
    const user = response.data['users']?.find((u: unknown) => u?.['email'] === email);
    if (!user) {
      throw new Error('User not found');
    }
    return { userId: user['userId'], token: user['token'] };
  }

  private async _verifyServiceAccount(email: string, token: string): Promise<void> {
    this._opts.logger.info({ email, dryRun: this._opts.dryRun }, 'Verifying service account');

    if (this._opts?.dryRun) {
      return;
    }

    await OmnistrateRepository._client.post(`/2022-09-01-00/validate-token`, {
      email,
      token,
    });
  }

  private async _createReadOnlySubscription(
    bearerToken: string,
    serviceId: string,
    productTierId: string,
  ): Promise<string> {
    return await axios
      .post(
        `${OmnistrateRepository._baseUrl}/2022-09-01-00/subscription`,
        {
          serviceId,
          productTierId,
        },
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        },
      )
      .then((response) => response.data);
  }

  private async _inviteReadOnlyUser(bearerToken: string, subscriptionId: string, email: string): Promise<void> {
    this._opts.logger.info({ subscriptionId, email, dryRun: this._opts.dryRun }, 'Inviting read-only user');

    if (this._opts?.dryRun) {
      return;
    }

    await axios.post(
      `${OmnistrateRepository._baseUrl}/2022-09-01-00/resource-instance/subscription/${subscriptionId}/invite-user`,
      {
        email,
        roleType: 'reader',
      },
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      },
    );
  }

  private async _getFreeSubscriptionIdFromEmail(email: string): Promise<{ subscriptionId: string }> {
    const { userId } = await this._getUser(email);

    const response = (await OmnistrateRepository._client.get(`/2022-09-01-00/fleet/user/${userId}`)).data;

    const subscription = response['subscriptions']?.find((s: unknown) => s?.['productTierName'] === 'FalkorDB Free');

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    return { subscriptionId: subscription['subscriptionId'] };
  }

  private async _getInstanceWithName(name: string): Promise<{ instanceId: string; userId: string }> {
    const response = (
      await OmnistrateRepository._client.get(
        `/2022-09-01-00/fleet/service/${this._serviceId}/environment/${this._environmentId}/instances`,
      )
    ).data;
    
    this._opts.logger.info({ name, response }, 'Getting instance with name');

    const instance = response['resourceInstances']?.find(
      (i: unknown) => i?.['consumptionResourceInstanceResult']?.['result_params']?.['name'] === name,
    );

    if (!instance) {
      throw new Error('Instance not found');
    }

    return {
      instanceId: instance['consumptionResourceInstanceResult']['id'],
      userId: instance['consumptionResourceInstanceResult']['createdByUserId'],
    };
  }

  private async _createFreeInstance(
    bearerToken: string,
    subscriptionId: string,
    name: string,
  ): Promise<{
    instanceId: string;
    username: string;
    password: string;
  }> {
    const username = 'falkordb';
    const password = randomBytes(16).toString('hex');
    const response = await axios
      .post(
        `${OmnistrateRepository._baseUrl}/2022-09-01-00/${this._createFreeInstancePath}?subscriptionId=${subscriptionId}`,
        {
          cloud_provider: 'gcp',
          region: 'us-central1',
          requestParams: { name, falkordbPassword: password, falkordbUser: username },
        },
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        },
      )
      .then((response) => response.data);

    return { username, password, instanceId: response['id'] };
  }

  private async _getInstanceDetails(instanceId: string): Promise<object> {
    return (
      await OmnistrateRepository._client.get(
        `/2022-09-01-00/fleet/service/${this._serviceId}/environment/${this._environmentId}/instance/${instanceId}`,
      )
    ).data;
  }

  private async _getInstanceResourceId(instanceId: string): Promise<string> {
    const response = await this._getInstanceDetails(instanceId);

    const resources = response?.['consumptionResourceInstanceResult']?.['detailedNetworkTopology'] as {
      [key: string]: object;
    };

    for (const [key, resource] of Object.entries(resources)) {
      if (resource['main']) {
        return key;
      }
    }
  }

  private async _deleteInstance(instanceId: string): Promise<void> {
    await OmnistrateRepository._client.delete(
      `/2022-09-01-00/fleet/service/${this._serviceId}/environment/${this._environmentId}/instance/${instanceId}`,
      {
        data: {
          resourceId: await this._getInstanceResourceId(instanceId),
        },
      },
    );
  }

  async createReadOnlySubscription(params: { marketplaceAccountId: string; userEmail: string }): Promise<void> {
    this._opts.logger.info(
      { marketplaceAccountId: params.marketplaceAccountId, userEmail: params.userEmail, dryRun: this._opts.dryRun },
      'Creating read-only subscription',
    );

    if (this._opts?.dryRun) {
      return;
    }

    if (await this._getUser(this._getSAEmail(params.marketplaceAccountId)).catch(() => false)) {
      throw new Error('Service account already exists');
    }

    // Create service account
    const { email, password } = await this._createServiceAccount(params.marketplaceAccountId);

    const { token } = await this._getUser(email);

    if (!token) {
      throw new Error('User token not found');
    }

    // Verify service account
    await this._verifyServiceAccount(email, token);

    // Get SA bearer token
    const bearerToken = await OmnistrateRepository._getCustomerBearer(email, password);

    // Register for free tier
    const subscriptionId = await this._createReadOnlySubscription(
      bearerToken,
      this._serviceId,
      this._freeProductTierId,
    );

    // Invite user as reader for free tier
    await this._inviteReadOnlyUser(bearerToken, subscriptionId, params.userEmail);
  }

  async createFreeDeployment(params: { marketplaceAccountId: string; entitlementId: string }): Promise<{
    instanceId: string;
    username: string;
    password: string;
  }> {
    this._opts.logger.info(
      { marketplaceAccountId: params.marketplaceAccountId, entitlementId: params.entitlementId, dryRun: this._opts.dryRun },
      'Creating free deployment',
    );

    if (this._opts?.dryRun) {
      return { instanceId: '123', username: 'falkordb', password: 'password' };
    }

    const saEmail = this._getSAEmail(params.marketplaceAccountId);

    await this._getUser(saEmail)

    // Get Free subscription ID
    const { subscriptionId } = await this._getFreeSubscriptionIdFromEmail(saEmail);

    const bearerToken = await OmnistrateRepository._getCustomerBearer(saEmail, this._serviceAccountSecret);

    // Create instance with the entitlement id as name
    const { instanceId, username, password } = await this._createFreeInstance(
      bearerToken,
      subscriptionId,
      params.entitlementId,
    );

    return {
      instanceId,
      username,
      password,
    };
  }

  async deleteDeployment(params: { marketplaceAccountId: string; entitlementId: string }): Promise<void> {
    this._opts.logger.info(
      { marketplaceAccountId: params.marketplaceAccountId, entitlementId: params.entitlementId, dryRun: this._opts.dryRun },
      'Deleting deployment',
    );

    if (this._opts?.dryRun) {
      return;
    }

    const { instanceId } = await this._getInstanceWithName(params.entitlementId);

    await this._deleteInstance(instanceId);
  }
}
