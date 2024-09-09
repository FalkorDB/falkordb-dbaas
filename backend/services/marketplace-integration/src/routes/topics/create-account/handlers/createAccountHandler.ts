import { RouteHandlerMethod } from 'fastify';
import { IOmnistrateRepository } from '../../../../repositories/omnistrate/IOmnistrateRepository';
import { ICommitRepository } from '../../../../repositories/commit/ICommitRepository';
import { ApiError } from '@falkordb/errors';
import { CreateAccountMessageSchema, CreateAccountMessageType } from '../../../../schemas/create-account';

export const createAccountHandler: RouteHandlerMethod<undefined, undefined, undefined, { Body: unknown }> = async (
  request,
) => {
  request.body = request.server.pubsubDecode(request, CreateAccountMessageSchema)['data'];

  const omnistrateRepository = request.diScope.resolve<IOmnistrateRepository>(IOmnistrateRepository.repositoryName);
  const commitRepository = request.diScope.resolve<ICommitRepository>(ICommitRepository.repositoryName);

  const { marketplaceAccountId, userEmail } = request.body as CreateAccountMessageType;

  try {
    await omnistrateRepository.createReadOnlySubscription({
      marketplaceAccountId,
      userEmail,
    });
  } catch (error) {
    request.log.error({ error, marketplaceAccountId, userEmail }, `Failed to create read-only subscription: ${error}`);
  }

  try {
    await commitRepository.verifyAccountCreated(marketplaceAccountId);
  } catch (error) {
    request.log.error({ error, marketplaceAccountId, userEmail }, `Failed to verify account creation: ${error}`);
  }
};
