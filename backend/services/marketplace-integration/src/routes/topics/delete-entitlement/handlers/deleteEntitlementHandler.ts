import { RouteHandlerMethod } from 'fastify';
import { IOmnistrateRepository } from '../../../../repositories/omnistrate/IOmnistrateRepository';
import { ICommitRepository } from '../../../../repositories/commit/ICommitRepository';
import { ApiError } from '@falkordb/errors';
import { DeleteEntitlementMessageSchema, DeleteEntitlementMessageType } from '../../../../schemas/delete-entitlement';

export const deleteEntitlementHandler: RouteHandlerMethod<undefined, undefined, undefined, { Body: unknown }> = async (
  request,
) => {
  request.body = request.server.pubsubDecode(request, DeleteEntitlementMessageSchema)['data'];

  const omnistrateRepository = request.diScope.resolve<IOmnistrateRepository>(IOmnistrateRepository.repositoryName);
  const commitRepository = request.diScope.resolve<ICommitRepository>(ICommitRepository.repositoryName);

  const { entitlementId, marketplaceAccountId } = request.body as DeleteEntitlementMessageType;

  try {
    await omnistrateRepository.deleteDeployment({
      marketplaceAccountId,
      entitlementId,
    });
  } catch (error) {
    request.log.error({ error, entitlementId, marketplaceAccountId }, `Failed to delete deployment: ${error}`);
  }

  try {
    await commitRepository.verifyEntitlementDeleted(marketplaceAccountId, entitlementId);
  } catch (error) {
    request.log.error({ error, entitlementId, marketplaceAccountId }, `Failed to verify entitlement deletion: ${error}`);
  }
};
