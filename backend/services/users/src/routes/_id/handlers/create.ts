import { RouteHandlerMethod } from 'fastify';
import { IUsersRepository } from '../../../repositories/users/IUsersRepository';
import { ApiError } from '@falkordb/errors';
import {
  CreateUserRequestBodySchemaType,
  CreateUserRequestParamsSchemaType,
  CreateUserResponseBodySchemaType,
} from '@falkordb/schemas/src/services/users/v1';

export const createUserHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: CreateUserRequestParamsSchemaType;
    Body: CreateUserRequestBodySchemaType;
    Reply: CreateUserResponseBodySchemaType;
  }
> = async (request) => {
  const repository = request.diScope.resolve<IUsersRepository>(IUsersRepository.repositoryName);

  try {
    const response = await repository.create({
      ...request.body,
      id: request.params.id,
    });
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, 'Internal Server Error', { error });
  }
};
