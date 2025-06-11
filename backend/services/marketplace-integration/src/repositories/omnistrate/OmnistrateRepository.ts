import { IOmnistrateRepository } from './IOmnistrateRepository';
import axios, { AxiosInstance, InternalAxiosRequestConfig, isAxiosError } from 'axios';
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

  private async _createServiceAccount(id: string, companyName: string): Promise<{ email: string; password: string }> {
    this._opts.logger.info({ id, companyName, dryRun: this._opts.dryRun }, 'Creating service account');

    if (this._opts?.dryRun) {
      return { email: this._getSAEmail(id), password: this._serviceAccountSecret };
    }

    const email = this._getSAEmail(id);
    await OmnistrateRepository._client.post(`/2022-09-01-00/customer-user-signup`, {
      email,
      legalCompanyName: `FalkorDB SA ${companyName}`,
      name: `FalkorDB Service Account ${id.replace(/-/g, '')}`,
      password: this._serviceAccountSecret,
    });
    return { email, password: this._serviceAccountSecret };
  }

  private async _createAccount(
    email: string,
    password: string,
    name: string,
    companyName: string,
  ): Promise<{ userId: string; }> {
    this._opts.logger.info({ email, name, companyName, dryRun: this._opts.dryRun }, 'Creating account');
    if (this._opts?.dryRun) {
      return { userId: '123' };
    }
    return await OmnistrateRepository._client.post(`/2022-09-01-00/customer-user-signup`, {
      email,
      legalCompanyName: companyName,
      name,
      password,
    }).then((response) => {
      const user = response.data['user'];
      if (!user) {
        throw new Error('User not found');
      }
      return { userId: user['userId'] };
    })
  }

  private async _createSubscription(
    productTierId: string,
    userId: string,
    marketplaceEntitlementId?: string,
  ): Promise<{ subscriptionId: string }> {
    this._opts.logger.info(
      { productTierId, marketplaceEntitlementId, dryRun: this._opts.dryRun },
      'Creating subscription',
    );

    if (this._opts?.dryRun) {
      return { subscriptionId: '123' };
    }
    const data = {
      productTierId,
      onBehalfOfCustomerUserId: userId,
      externalPayerId: marketplaceEntitlementId,
      paymentChannelType: "CUSTOM",
      serviceId: this._serviceId,
    };

    if (!marketplaceEntitlementId) {
      delete data.externalPayerId;
      delete data.paymentChannelType;
    }

    try {

      const response = await OmnistrateRepository._client.post(`/2022-09-01-00/fleet/service/${this._serviceId}/environment/${this._environmentId}/subscription`, data);


      const subscriptionId = response.data['id'];
      if (!subscriptionId) {
        throw new Error('Subscription not found');
      }

      return { subscriptionId };
    } catch (error) {
      if (isAxiosError(error)) {
        this._opts.logger.error(
          { error, request: error.request, productTierId, marketplaceEntitlementId, userId },
          'Failed to create subscription',
        );
        throw new Error(`Failed to create subscription: ${error.response?.data?.message || error.message}`);
      } else {
        throw error;
      }
    }
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

  private async _getUserSubscriptions(userId: string): Promise<{ subscriptionId: string, productTierId: string }[]> {
    this._opts.logger.info({ userId, dryRun: this._opts.dryRun }, 'Getting user subscriptions');

    if (this._opts?.dryRun) {
      return Promise.resolve([{ subscriptionId: '123', productTierId: '123' }]);
    }

    return await OmnistrateRepository._client.get(`/2022-09-01-00/fleet/user/${userId}`).then((response) => {
      const subscriptions = response.data['subscriptions'];
      if (!subscriptions) {
        throw new Error('Subscriptions not found');
      }
      return subscriptions.map((s: unknown) => ({
        subscriptionId: s['subscriptionId'],
        productTierId: s['productTierId'],
      }));
    });
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

  private async _inviteUser(marketplaceAccountId: string, subscriptionId: string, email: string, role: 'reader' | 'editor'): Promise<void> {
    this._opts.logger.info({ subscriptionId, marketplaceAccountId, email, dryRun: this._opts.dryRun }, 'Inviting read-only user');

    if (this._opts?.dryRun) {
      return;
    }

    const saEmail = this._getSAEmail(marketplaceAccountId);

    const bearerToken = await OmnistrateRepository._getCustomerBearer(saEmail, this._serviceAccountSecret);

    await axios.post(
      `${OmnistrateRepository._baseUrl}/2022-09-01-00/resource-instance/subscription/${subscriptionId}/invite-user`,
      {
        email,
        roleType: role,
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

  private async _listInstancesInSubscription(
    productTierId: string,
    subscriptionId: string,
  ): Promise<{ instanceId: string }[]> {
    this._opts.logger.info({ productTierId, subscriptionId }, 'Listing instances');

    const response = (
      await OmnistrateRepository._client.get(
        `/2022-09-01-00/fleet/service/${this._serviceId}/environment/${this._environmentId}/instances?SubscriptionId=${subscriptionId}&ProductTierId=${productTierId}`,
      )
    ).data;


    const instances = response['resourceInstances'];

    if (!instances) {
      throw new Error('Instances not found');
    }

    return instances.map((i: unknown) => ({
      instanceId: i['consumptionResourceInstanceResult']['id'],
    }));
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
      'FalkorDB Free'
    );

    return {
      instanceId,
      username,
      password,
    };
  }

  async deleteDeployments(params: { marketplaceAccountId: string, productTierId: string }): Promise<void> {
    this._opts.logger.info(
      'Deleting deployments',
      { marketplaceAccountId: params.marketplaceAccountId, productTierId: params.productTierId, dryRun: this._opts.dryRun },
    );

    if (this._opts?.dryRun) {
      return;
    }

    const user = await this._getUser(this._getSAEmail(params.marketplaceAccountId));

    const subscriptions = await this._getUserSubscriptions(user.userId);
    const subscription = subscriptions.find((s) => s.productTierId === params.productTierId);

    if (!subscription) {
      this._opts.logger.info(
        { marketplaceAccountId: params.marketplaceAccountId, productTierId: params.productTierId },
        'No subscription found',
      );
      return;
    }

    const instances = await this._listInstancesInSubscription(
      params.productTierId,
      subscription.subscriptionId,
    );
    if (!instances || instances.length === 0) {
      this._opts.logger.info(
        { marketplaceAccountId: params.marketplaceAccountId, productTierId: params.productTierId },
        'No instances found',
      );
      return;
    }

    await Promise.all(
      instances.map((i) => this._deleteInstance(i.instanceId)),
    );
  }

  async createServiceAccount(params: {
    marketplaceAccountId: string;
    companyName: string;
  }): Promise<void> {
    this._opts.logger.info(
      {
        marketplaceAccountId: params.marketplaceAccountId,
        companyName: params.companyName,
        dryRun: this._opts.dryRun,
      },
      'Creating service account',
    );

    if (this._opts?.dryRun) {
      return;
    }

    try {
      await this._createServiceAccount(
        params.marketplaceAccountId,
        params.companyName,
      )
    } catch (error) {
      this._opts.logger.error({ error, marketplaceAccountId: params.marketplaceAccountId, companyName: params.companyName }, `Failed to create account: ${error}`);
      throw new Error('Failed to create account');
    }

    const sa = await this._getUser(this._getSAEmail(params.marketplaceAccountId));

    try {
      await this._verifyServiceAccount(
        this._getSAEmail(params.marketplaceAccountId),
        sa.token,
      );
    } catch (error) {
      this._opts.logger.error({ error, marketplaceAccountId: params.marketplaceAccountId }, `Failed to verify account: ${error}`);
      throw new Error('Failed to verify account');
    }
  }

  async createSubscription(params: {
    productTierId: string,
    marketplaceAccountId: string
    entitlementId?: string
  }): Promise<{ subscriptionId: string }> {
    this._opts.logger.info(
      {
        productTierId: params.productTierId,
        marketplaceAccountId: params.marketplaceAccountId,
        entitlementId: params.entitlementId,
        dryRun: this._opts.dryRun,
      },
      'Creating subscription',
    );
    if (this._opts?.dryRun) {
      return { subscriptionId: '123' };
    }

    const user = await this._getUser(this._getSAEmail(params.marketplaceAccountId));

    const subscriptionId = await this._createSubscription(
      params.productTierId,
      user.userId,
      params.entitlementId,
    )

    if (!subscriptionId) {
      throw new Error('Subscription not found');
    }

    return { subscriptionId: subscriptionId.subscriptionId };
  }

  async inviteUserToSubscription(
    params: {
      marketplaceAccountId: string;
      subscriptionId: string;
      email: string;
      role: 'reader' | 'editor';
    },
  ): Promise<void> {
    this._opts.logger.info(
      { subscriptionId: params.subscriptionId, email: params.email, dryRun: this._opts.dryRun },
      'Inviting user to subscription',
    );

    if (this._opts?.dryRun) {
      return;
    }
    try {
      await this._inviteUser(params.marketplaceAccountId, params.subscriptionId, params.email, params.role)
    } catch (error) {
      if (isAxiosError(error)) {
        this._opts.logger.error(
          { error, subscriptionId: params.subscriptionId, email: params.email },
          'Failed to invite user',
        );
        throw new Error(`Failed to invite user: ${error.response?.data?.message || error.message}`);
      }

      this._opts.logger.error(
        { error, subscriptionId: params.subscriptionId, email: params.email },
        'Failed to invite user',
      );
      throw new Error('Failed to invite user');
    }
  }

}
