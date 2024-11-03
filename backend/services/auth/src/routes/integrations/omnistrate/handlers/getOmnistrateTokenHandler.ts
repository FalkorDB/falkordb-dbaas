import { ApiError } from '@falkordb/errors';
import { RouteHandlerMethod } from 'fastify';
import { GetOmnistrateTokenHeadersSchemaType } from '@falkordb/schemas/dist/services/auth/v1';
import assert from 'assert';
import { IOmnistrateRepository } from '../../../../repositories/omnistrate/IOmnistrateRepository';

export const getOmnistrateTokenHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Headers: GetOmnistrateTokenHeadersSchemaType;
  }
> = async (request) => {
  assert(request.headers.authorization, 'Authorization header is required');
  assert(request.server.config.OMNISTRATE_TOKEN_REQUEST_API_KEY, 'OMNISTRATE_TOKEN_REQUEST_API_KEY is required');

  const repository = request.diScope.resolve<IOmnistrateRepository>(IOmnistrateRepository.repositoryName);

  if (request.headers.authorization !== request.server.config.OMNISTRATE_TOKEN_REQUEST_API_KEY) {
    throw request.server.httpErrors.createError(401, 'Unauthorized Request');
  }

  try {
    return await repository.getToken();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, 'Internal Server Error', { error });
  }
};
