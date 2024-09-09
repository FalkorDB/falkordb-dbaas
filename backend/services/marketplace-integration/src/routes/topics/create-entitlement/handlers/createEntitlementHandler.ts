import { RouteHandlerMethod } from 'fastify';
import { IOmnistrateRepository } from '../../../../repositories/omnistrate/IOmnistrateRepository';
import { ICommitRepository } from '../../../../repositories/commit/ICommitRepository';
import { ApiError } from '@falkordb/errors';
import { CreateEntitlementMessageSchema, CreateEntitlementMessageType } from '../../../../schemas/create-entitlement';
import { IMailRepository } from '../../../../repositories/mail/IMailRepository';

export const createEntitlementHandler: RouteHandlerMethod<undefined, undefined, undefined, { Body: unknown }> = async (
  request,
) => {
  request.body = request.server.pubsubDecode(request, CreateEntitlementMessageSchema)['data'];

  const omnistrateRepository = request.diScope.resolve<IOmnistrateRepository>(IOmnistrateRepository.repositoryName);
  const commitRepository = request.diScope.resolve<ICommitRepository>(ICommitRepository.repositoryName);
  const mailRepository = request.diScope.resolve<IMailRepository>(IMailRepository.repositoryName);

  const { entitlementId, marketplaceAccountId, productTierId, userEmail } =
    request.body as CreateEntitlementMessageType;

  if (!['free'].includes(productTierId)) {
    request.log.info({ entitlementId, productTierId, marketplaceAccountId }, 'Ignoring entitlement');
    return;
  }

  let instanceId: string, username: string, password: string;
  try {
    const instance = await omnistrateRepository.createFreeDeployment({
      marketplaceAccountId,
      entitlementId,
    });
    instanceId = instance.instanceId;
    username = instance.username;
    password = instance.password;
  } catch (error) {
    request.log.error({ error, entitlementId, marketplaceAccountId }, `Failed to create free deployment: ${error}`);
    throw ApiError.internalServerError('Failed to create free deployment', 'CREATE_FREE_DEPLOYMENT_FAILED');
  }

  try {
    await commitRepository.verifyEntitlementCreated(marketplaceAccountId, entitlementId);
  } catch (error) {
    request.log.error(
      { error, entitlementId, marketplaceAccountId },
      `Failed to verify entitlement creation: ${error}`,
    );
  }

  try {
    await mailRepository.sendFreeInstanceCreatedEmail({
      email: userEmail,
      instanceId,
      username,
      password,
      omnistrateServiceId: request.server.config.OMNISTRATE_SERVICE_ID,
      omnistrateEnvironmentId: request.server.config.OMNISTRATE_ENVIRONMENT_ID,
      omnistrateFreeResourceId: request.server.config.OMNISTRATE_FREE_RESOURCE_ID,
      omnistrateFreeTierId: request.server.config.OMNISTRATE_FREE_PRODUCT_TIER_ID,
    });
  } catch (error) {
    request.log.error(
      { error, entitlementId, marketplaceAccountId },
      `Failed to send free entitlement email: ${error}`,
    );
  }
};
