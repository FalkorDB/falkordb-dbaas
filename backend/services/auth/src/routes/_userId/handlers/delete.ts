import { DeleteUserRequestParamsSchemaType } from '@falkordb/schemas/services/auth/v1';
import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import { IAuthRepository } from '../../../repositories/auth/IAuthRepository';
import { DeleteService } from '../services/DeleteService';
import { IUsersRepository } from '../../../repositories/users/IUsersRepository';

export const deleteUserHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: DeleteUserRequestParamsSchemaType;
  }
> = async (request) => {
  const opts = { logger: request.log };
  const authRepository = request.diScope.resolve<IAuthRepository>(IAuthRepository.repositoryName);
  const usersRepository = request.diScope.resolve<IUsersRepository>(IUsersRepository.repositoryName);

  const service = new DeleteService(opts, authRepository, usersRepository);

  try {
    const response = await service.delete(request.params.userId);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, 'Internal Server Error', { error });
  }
};
