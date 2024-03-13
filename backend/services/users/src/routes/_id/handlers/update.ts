import { RouteHandlerMethod } from 'fastify';
import { IUsersRepository } from '../../../repositories/users/IUsersRepository';
import { ApiError } from '@falkordb/errors';
import {
  UpdateUserRequestBodySchemaType,
  UpdateUserRequestParamsSchemaType,
  UpdateUserResponseBodySchemaType,
} from '@falkordb/schemas/src/services/users/v1';

export const updateUserHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: UpdateUserRequestParamsSchemaType;
    Body: UpdateUserRequestBodySchemaType;
    Reply: UpdateUserResponseBodySchemaType;
  }
> = async (request) => {
  const repository = request.diScope.resolve<IUsersRepository>(IUsersRepository.repositoryName);

  try {
    const response = await repository.update(request.params.id, request.body);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, 'Internal Server Error', { error });
  }
};
