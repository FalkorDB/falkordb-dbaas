import { RouteHandlerMethod } from 'fastify';
import { IOmnistrateRepository } from '../../../../repositories/omnistrate/IOmnistrateRepository';
import { ICommitRepository } from '../../../../repositories/commit/ICommitRepository';
import { ApiError } from '@falkordb/errors';
import { CreateEntitlementMessageSchema, CreateEntitlementMessageType } from '../../../../schemas/create-entitlement';
import { IMailRepository } from '../../../../repositories/mail/IMailRepository';
import { CreateEntitlementController } from '../controller/createEntitlementController';

export const createEntitlementHandler: RouteHandlerMethod<undefined, undefined, undefined, { Body: unknown }> = async (
  request,
) => {
  request.body = request.server.pubsubDecode(request, CreateEntitlementMessageSchema)['data'];

  const omnistrateRepository = request.diScope.resolve<IOmnistrateRepository>(IOmnistrateRepository.repositoryName);
  const commitRepository = request.diScope.resolve<ICommitRepository>(ICommitRepository.repositoryName);
  const mailRepository = request.diScope.resolve<IMailRepository>(IMailRepository.repositoryName);

  const { entitlementId, marketplaceAccountId, productTierId, userEmail } =
    request.body as CreateEntitlementMessageType;

  return await new CreateEntitlementController(
    omnistrateRepository,
    commitRepository,
    mailRepository,
    {
      omnistrateServiceId: request.server.config.OMNISTRATE_SERVICE_ID,
      omnistrateEnvironmentId: request.server.config.OMNISTRATE_ENVIRONMENT_ID,
      omnistrateFreeResourceId: request.server.config.OMNISTRATE_FREE_RESOURCE_ID,
      omnistrateFreeProductTierId: request.server.config.OMNISTRATE_FREE_PRODUCT_TIER_ID,
      omnistrateStartupProductTierId: request.server.config.OMNISTRATE_STARTUP_PRODUCT_TIER_ID,
      omnistrateProProductTierId: request.server.config.OMNISTRATE_PRO_PRODUCT_TIER_ID,
      omnistrateEnterpriseProductTierId: request.server.config.OMNISTRATE_ENTERPRISE_PRODUCT_TIER_ID,
    },
    {
      logger: request.log,
    }
  ).handleCreateEntitlement({
    entitlementId,
    marketplaceAccountId,
    productTierId,
    userEmail,
  });
};
