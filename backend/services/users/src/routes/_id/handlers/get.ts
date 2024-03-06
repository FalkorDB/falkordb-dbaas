import { RouteHandlerMethod } from 'fastify';
import { IUsersRepository } from '../../../repositories/users/IUsersRepository';
import { ApiError } from '@falkordb/errors';
import { GetUserRequestParamsSchemaType, GetUserResponseBodySchemaType } from '../schemas/user';

export const getUserHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: GetUserRequestParamsSchemaType;
    Reply: GetUserResponseBodySchemaType;
  }
> = async (request) => {
  const repository = request.diScope.resolve<IUsersRepository>(IUsersRepository.repositoryName);

  try {
    const response = await repository.get(request.params.id);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, 'Internal Server Error', { error });
  }
};
