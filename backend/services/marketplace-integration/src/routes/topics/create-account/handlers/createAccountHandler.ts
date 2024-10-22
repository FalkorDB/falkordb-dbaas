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
    // Check if error is the account already exists
    if (error instanceof Error && error.message.includes('already exists')) {
      request.log.info({ marketplaceAccountId, userEmail }, 'Account already exists');
      return;
    }

    request.log.error({ error, marketplaceAccountId, userEmail }, `Failed to create read-only subscription: ${error}`);
    return;
  }

  try {
    await commitRepository.verifyAccountCreated(marketplaceAccountId);
  } catch (error) {
    request.log.error({ error, marketplaceAccountId, userEmail }, `Failed to verify account creation: ${error}`);
  }
};
