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

  const { entitlementId, marketplaceAccountId } = request.body as DeleteEntitlementMessageType;

  try {
    await omnistrateRepository.deleteDeployments({
      marketplaceAccountId,
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
    await commitRepository.verifyEntitlementDeleted(marketplaceAccountId, entitlementId);
  } catch (error) {
    request.log.error({ error, entitlementId, marketplaceAccountId }, `Failed to verify entitlement deletion: ${error}`);
  }
};
