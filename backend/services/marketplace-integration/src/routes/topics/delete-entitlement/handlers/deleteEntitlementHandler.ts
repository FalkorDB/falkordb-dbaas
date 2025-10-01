import { RouteHandlerMethod } from 'fastify';
import { IOmnistrateRepository } from '../../../../repositories/omnistrate/IOmnistrateRepository';
import { ICommitRepository } from '../../../../repositories/commit/ICommitRepository';
import { DeleteEntitlementMessageSchema, DeleteEntitlementMessageType } from '../../../../schemas/delete-entitlement';

export const deleteEntitlementHandler: RouteHandlerMethod<undefined, undefined, undefined, { Body: unknown }> = async (
  request,
) => {
  request.body = request.server.pubsubDecode(request, DeleteEntitlementMessageSchema)['data'];

  const omnistrateRepository = request.diScope.resolve<IOmnistrateRepository>(IOmnistrateRepository.repositoryName);
  const commitRepository = request.diScope.resolve<ICommitRepository>(ICommitRepository.repositoryName);

  const { entitlementId, marketplaceAccountId, productTierId } = request.body as DeleteEntitlementMessageType;

  let productTierMapped = "";
  switch (productTierId) {
    case 'free':
      productTierMapped = request.server.config.OMNISTRATE_FREE_PRODUCT_TIER_ID;
      break;
    case 'startup':
      productTierMapped = request.server.config.OMNISTRATE_STARTUP_PRODUCT_TIER_ID;
      break;
    case 'pro':
      productTierMapped = request.server.config.OMNISTRATE_PRO_PRODUCT_TIER_ID;
      break;
    case 'enterprise':
      productTierMapped = request.server.config.OMNISTRATE_ENTERPRISE_PRODUCT_TIER_ID;
      break;
    default:
      request.log.error({ entitlementId, marketplaceAccountId, productTierId }, `Unknown product tier ID: ${productTierId}`);
      return;
  }

  try {
    await omnistrateRepository.deleteDeployments({
      marketplaceAccountId,
      productTierId: productTierMapped
    });
  } catch (error) {
    // Check if instance was not found
    if (error instanceof Error && error.message.includes('not found')) {
      throw error;
    }
    request.log.error({ error, entitlementId, marketplaceAccountId }, `Failed to delete deployments: ${error}`);
    return;
  }

  try {
    await omnistrateRepository.removeUsersFromSubscription({
      marketplaceAccountId,
      productTierId: productTierMapped,
    })
  } catch (error) {
    request.log.error({ error, entitlementId, marketplaceAccountId }, `Failed to remove users from subscription: ${error}`);
    throw error;
  }


  try {
    await omnistrateRepository.cancelSubscription({
      marketplaceAccountId,
      productTierId: productTierMapped,
    });
  } catch (error) {
    request.log.error({ error, entitlementId, marketplaceAccountId }, `Failed to cancel subscription: ${error}`);
  }

  try {
    await commitRepository.verifyEntitlementDeleted(marketplaceAccountId, entitlementId);
  } catch (error) {
    request.log.error({ error, entitlementId, marketplaceAccountId }, `Failed to verify entitlement deletion: ${error}`);
  }
};
