import { RouteHandlerMethod } from 'fastify';
import { IOmnistrateRepository } from '../../../../repositories/omnistrate/IOmnistrateRepository';
import { ICommitRepository } from '../../../../repositories/commit/ICommitRepository';
import { ApiError } from '@falkordb/errors';
import { CreateAccountMessageSchema, CreateAccountMessageType } from '../../../../schemas/create-account';
import { CreateAccountController } from '../controllers/createAccountController';
import { ISecretsRepository } from '../../../../repositories/secrets/ISecretsRepository';

export const createAccountHandler: RouteHandlerMethod<undefined, undefined, undefined, { Body: unknown }> = async (
  request,
) => {
  request.body = request.server.pubsubDecode(request, CreateAccountMessageSchema)['data'];

  const omnistrateRepository = request.diScope.resolve<IOmnistrateRepository>(IOmnistrateRepository.repositoryName);
  const commitRepository = request.diScope.resolve<ICommitRepository>(ICommitRepository.repositoryName);
  const secretsRepository = request.diScope.resolve<ISecretsRepository>(ISecretsRepository.repositoryName);

  const { marketplaceAccountId, userEmail, companyName, name, passwordRef } = request.body as CreateAccountMessageType;

  return await new CreateAccountController(
    omnistrateRepository,
    commitRepository,
    secretsRepository,
    {
      logger: request.log,
    },
  ).createAccount({ marketplaceAccountId, userEmail, companyName, name, passwordRef });
};
