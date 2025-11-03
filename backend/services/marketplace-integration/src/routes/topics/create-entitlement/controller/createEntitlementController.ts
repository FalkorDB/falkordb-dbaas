import { FastifyBaseLogger } from "fastify";
import { ICommitRepository } from "../../../../repositories/commit/ICommitRepository";
import { IMailRepository } from "../../../../repositories/mail/IMailRepository";
import { IOmnistrateRepository } from "../../../../repositories/omnistrate/IOmnistrateRepository";
import { ApiError } from "@falkordb/errors";


export class CreateEntitlementController {
  constructor(
    private readonly omnistrateRepository: IOmnistrateRepository,
    private readonly commitRepository: ICommitRepository,
    private readonly mailRepository: IMailRepository,
    private readonly params: {
      omnistrateServiceId: string;
      omnistrateEnvironmentId: string;
      omnistrateFreeResourceId: string;
      omnistrateFreeProductTierId: string;
      omnistrateStartupProductTierId: string;
      omnistrateProProductTierId: string;
      omnistrateEnterpriseProductTierId: string;
    },
    private _opts: {
      logger: FastifyBaseLogger,
    }
  ) { }

  async handleCreateEntitlement(params: {
    entitlementId: string;
    marketplaceAccountId: string;
    productTierId: string;
    userEmail: string;
  }): Promise<void> {
    const { productTierId } = params;
    switch (productTierId) {
      case 'free':
        return this._handleFreeEntitlement(params);
      case 'startup':
        return this._handleStartupEntitlement(params);
      case 'pro':
        return this._handleProEntitlement(params);
      case 'enterprise':
        return this._handleEnterpriseEntitlement(params);
      case 'enterprise-usage':
      case 'enterprise-usage-commitment':
        return this._handleEnterpriseWithUsageEntitlement(params);
      default:
        this._opts.logger.info({
          entitlementId: params.entitlementId,
          productTierId: params.productTierId,
          marketplaceAccountId: params.marketplaceAccountId,
        }, 'Ignoring entitlement');
        return;
    }
  }

  private async _handleFreeEntitlement({
    entitlementId,
    marketplaceAccountId,
    productTierId,
    userEmail,
  }: {
    entitlementId: string;
    marketplaceAccountId: string;
    productTierId: string;
    userEmail: string;
  }): Promise<void> {
    this._opts.logger.info({
      entitlementId,
      productTierId,
      marketplaceAccountId,
      userEmail
    }, 'Handling free entitlement');

    let subscriptionId: string;
    try {
      await this.omnistrateRepository.createSubscription({
        productTierId: this.params.omnistrateFreeProductTierId,
        marketplaceAccountId,
      }).then((result) => {
        subscriptionId = result.subscriptionId;
      });
    } catch (error) {

      if (error instanceof Error && error.message.includes('User not found')) {
        throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
      }

      this._opts.logger.error({ error, entitlementId, marketplaceAccountId, userEmail }, `Failed to create subscription: ${error.response?.data ?? error}`);
      return;
    }

    let instanceId: string, username: string, password: string;
    try {
      const instance = await this.omnistrateRepository.createFreeDeployment({
        marketplaceAccountId,
      });
      instanceId = instance.instanceId;
      username = instance.username;
      password = instance.password;
    } catch (error) {
      this._opts.logger.error({ error, entitlementId, marketplaceAccountId, userEmail }, `Failed to create free deployment: ${error.response?.data ?? error}`);
      return;
    }

    try {
      await this.omnistrateRepository.inviteUserToSubscription({
        marketplaceAccountId,
        subscriptionId,
        email: userEmail,
        role: 'reader'
      });
    } catch (error) {
      this._opts.logger.error({ error, entitlementId, marketplaceAccountId, userEmail }, `Failed to invite user: ${error.response?.data ?? error}`);
    }

    try {
      await this.commitRepository.verifyEntitlementCreated(marketplaceAccountId, entitlementId);
    } catch (error) {
      this._opts.logger.error(
        { error, entitlementId, marketplaceAccountId, userEmail, instanceId },
        `Failed to verify entitlement creation: ${error.response?.data ?? error}`,
      );
    }

    try {
      await this.mailRepository.sendFreeInstanceCreatedEmail({
        email: userEmail,
        instanceId,
        username,
        password,
        omnistrateServiceId: this.params.omnistrateServiceId,
        omnistrateEnvironmentId: this.params.omnistrateEnvironmentId,
        omnistrateFreeResourceId: this.params.omnistrateFreeResourceId,
        omnistrateFreeTierId: this.params.omnistrateFreeProductTierId,
      });
    } catch (error) {
      this._opts.logger.error(
        { error, entitlementId, marketplaceAccountId, userEmail, instanceId },
        `Failed to send free entitlement email: ${error.response?.data ?? error}`,
      );
    }

  }

  private async _handleStartupEntitlement({
    entitlementId,
    marketplaceAccountId,
    productTierId,
    userEmail,
  }: {
    entitlementId: string;
    marketplaceAccountId: string;
    productTierId: string;
    userEmail: string;
  }): Promise<void> {
    this._opts.logger.info({
      entitlementId,
      productTierId,
      marketplaceAccountId,
      userEmail
    }, 'Handling startup entitlement');

    let subscriptionId: string;
    try {
      await this.omnistrateRepository.createSubscription({
        productTierId: this.params.omnistrateStartupProductTierId,
        marketplaceAccountId,
        entitlementId,
      }).then((result) => {
        subscriptionId = result.subscriptionId;
      });
    } catch (error) {

      if (error instanceof Error && error.message.includes('User not found')) {
        throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
      }

      this._opts.logger.error({ error, entitlementId, marketplaceAccountId, userEmail }, `Failed to create subscription: ${error.response?.data ?? error}`);
      return;
    }

    try {
      await this.commitRepository.verifyEntitlementCreated(marketplaceAccountId, entitlementId);
    } catch (error) {
      this._opts.logger.error(
        { error, entitlementId, marketplaceAccountId, userEmail },
        `Failed to verify entitlement creation: ${error.response?.data ?? error}`,
      );
    }

    try {
      await this.omnistrateRepository.inviteUserToSubscription({
        marketplaceAccountId,
        subscriptionId,
        email: userEmail,
        role: 'editor'
      });
    } catch (error) {
      this._opts.logger.error({ error, entitlementId, marketplaceAccountId, userEmail }, `Failed to invite user: ${error.response?.data ?? error}`);
    }
  }

  private async _handleProEntitlement({
    entitlementId,
    marketplaceAccountId,
    productTierId,
    userEmail,
  }: {
    entitlementId: string;
    marketplaceAccountId: string;
    productTierId: string;
    userEmail: string;
  }): Promise<void> {
    this._opts.logger.info({
      entitlementId,
      productTierId,
      marketplaceAccountId,
      userEmail
    }, 'Handling pro entitlement');

    let subscriptionId: string;
    try {
      await this.omnistrateRepository.createSubscription({
        productTierId: this.params.omnistrateProProductTierId,
        marketplaceAccountId,
        entitlementId,
      }).then((result) => {
        subscriptionId = result.subscriptionId;
      });
    } catch (error) {

      if (error instanceof Error && error.message.includes('User not found')) {
        throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
      }

      this._opts.logger.error({ error, entitlementId, marketplaceAccountId, userEmail }, `Failed to create subscription: ${error.response?.data ?? error}`);
      return;
    }

    try {
      await this.commitRepository.verifyEntitlementCreated(marketplaceAccountId, entitlementId);
    } catch (error) {
      this._opts.logger.error(
        { error, entitlementId, marketplaceAccountId, userEmail },
        `Failed to verify entitlement creation: ${error.response?.data ?? error}`,
      );
    }

    try {
      await this.omnistrateRepository.inviteUserToSubscription({
        marketplaceAccountId,
        subscriptionId,
        email: userEmail,
        role: 'editor'
      });
    } catch (error) {
      this._opts.logger.error({ error, entitlementId, marketplaceAccountId, userEmail }, `Failed to invite user: ${error.response?.data ?? error}`);
    }
  }

  private async _handleEnterpriseEntitlement({
    entitlementId,
    marketplaceAccountId,
    productTierId,
    userEmail,
  }: {
    entitlementId: string;
    marketplaceAccountId: string;
    productTierId: string;
    userEmail: string;
  }): Promise<void> {
    this._opts.logger.info({
      entitlementId,
      productTierId,
      marketplaceAccountId,
      userEmail
    }, 'Handling enterprise entitlement');

    let subscriptionId: string;
    try {
      await this.omnistrateRepository.createSubscription({
        productTierId: this.params.omnistrateEnterpriseProductTierId,
        marketplaceAccountId,
        entitlementId,
      }).then((result) => {
        subscriptionId = result.subscriptionId;
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('User not found')) {
        throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
      }

      this._opts.logger.error({ error, entitlementId, marketplaceAccountId, userEmail }, `Failed to create subscription: ${error.response?.data ?? error}`);
      return;
    }

    try {
      await this.commitRepository.verifyEntitlementCreated(marketplaceAccountId, entitlementId);
    } catch (error) {
      this._opts.logger.error(
        { error, entitlementId, marketplaceAccountId, userEmail },
        `Failed to verify entitlement creation: ${error.response?.data ?? error}`,
      );
    }

    try {
      await this.omnistrateRepository.inviteUserToSubscription({
        marketplaceAccountId,
        subscriptionId,
        email: userEmail,
        role: 'reader'
      });
    } catch (error) {
      this._opts.logger.error({ error, entitlementId, marketplaceAccountId, userEmail }, `Failed to invite user: ${error.response?.data ?? error}`);
    }
  }


  private async _handleEnterpriseWithUsageEntitlement({
    entitlementId,
    marketplaceAccountId,
    productTierId,
    userEmail,
  }: {
    entitlementId: string;
    marketplaceAccountId: string;
    productTierId: string;
    userEmail: string;
  }): Promise<void> {
    this._opts.logger.info({
      entitlementId,
      productTierId,
      marketplaceAccountId,
      userEmail
    }, 'Handling enterprise usage entitlement');

    let subscriptionId: string;
    try {
      await this.omnistrateRepository.createSubscription({
        productTierId: this.params.omnistrateEnterpriseProductTierId,
        marketplaceAccountId,
        entitlementId,
      }).then((result) => {
        subscriptionId = result.subscriptionId;
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('User not found')) {
        throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
      }

      this._opts.logger.error({ error, entitlementId, marketplaceAccountId, userEmail }, `Failed to create subscription: ${error.response?.data ?? error}`);
      return;
    }

    try {
      await this.commitRepository.verifyEntitlementCreated(marketplaceAccountId, entitlementId);
    } catch (error) {
      this._opts.logger.error(
        { error, entitlementId, marketplaceAccountId, userEmail },
        `Failed to verify entitlement creation: ${error.response?.data ?? error}`,
      );
    }

    try {
      await this.omnistrateRepository.inviteUserToSubscription({
        marketplaceAccountId,
        subscriptionId,
        email: userEmail,
        role: 'editor'
      });
    } catch (error) {
      this._opts.logger.error({ error, entitlementId, marketplaceAccountId, userEmail }, `Failed to invite user: ${error.response?.data ?? error}`);
    }
  }
}