/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { isAxiosError } from 'axios';
import assert from 'assert';
import { FastifyBaseLogger } from 'fastify';
import { IOmnistrateRepository, OmnistrateInstance, SubscriptionUser } from './IOmnistrateRepository';
import { OmnistrateClient } from './OmnistrateClient';
import { ApiError } from '@falkordb/errors';

export class OmnistrateRepository implements IOmnistrateRepository {
  constructor(
    private _omnistrateClient: OmnistrateClient,
    private _serviceId: string,
    private _environmentId: string,
    private _options: { logger: FastifyBaseLogger },
  ) {
    assert(_serviceId, 'OmnistrateRepository: Service ID is required');
    assert(_environmentId, 'OmnistrateRepository: Environment ID is required');
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
        const sanitizedError = {
          message: error.message,
          status: error.response?.status,
          code: error.code,
        };
        this._options.logger.error({ error: sanitizedError }, 'Invalid token');
      } else {
        const sanitizedError = {
          message: error instanceof Error ? error.message : 'Unknown error',
          status: isAxiosError(error) ? error.response?.status : undefined,
          code: isAxiosError(error) ? error.code : undefined,
        };
        this._options.logger.error({ error: sanitizedError }, 'Error validating token');
      }
      return false;
    }
  }

  async getInstance(instanceId: string): Promise<OmnistrateInstance> {
    assert(instanceId, 'OmnistrateRepository: Instance ID is required');

    this._options.logger.info({ instanceId }, 'Getting instance');

    let instance = null;
    try {
      instance = await this._omnistrateClient.client
        .get(
          `/2022-09-01-00/fleet/service/${this._serviceId}/environment/${this._environmentId}/instance/${instanceId}`,
        )
        .then((response) => response.data);
    } catch (error) {
      const sanitizedError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: isAxiosError(error) ? error.response?.status : undefined,
        code: isAxiosError(error) ? error.code : undefined,
      };
      this._options.logger.error({ error: sanitizedError }, 'Error getting instance');
      throw ApiError.internalServerError('Error getting instance', 'INSTANCE_RETRIEVAL_FAILED');
    }

    const deploymentCellID = instance?.['deploymentCellID'];
    if (!deploymentCellID) {
      throw ApiError.internalServerError('Missing deploymentCellID in instance data', 'MISSING_DEPLOYMENT_CELL_ID');
    }

    return {
      id: instance?.['consumptionResourceInstanceResult']?.['id'],
      clusterId: `${
        instance?.['cloudProvider'] === 'gcp'
          ? 'c-' + deploymentCellID.replace(/-/g, '')
          : deploymentCellID
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

    const response = await this._omnistrateClient.client.get(
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
