import { RouteHandlerMethod } from 'fastify';
import { GetMeRequestHeadersSchemaType, GetMeResponseBodySchemaType } from '@falkordb/schemas/services/users/v1';
import { IUsersRepository } from '../../../repositories/users/IUsersRepository';
import { ApiError } from '@falkordb/errors';

export const getMeHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Headers: GetMeRequestHeadersSchemaType;
    Reply: GetMeResponseBodySchemaType;
  }
> = async (request) => {
  const repository = request.diScope.resolve<IUsersRepository>(IUsersRepository.repositoryName);

  try {
    const response = await repository.get(request.headers['x-falkordb-userid']);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, 'Internal Server Error', { error });
  }
};
