import {
  SignUpWithEmailRequestBodySchemaType,
  SignUpWithEmailResponseSuccessSchemaType,
} from '@falkordb/schemas/dist/services/auth/v1';
import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import { IAuthRepository } from '../../../repositories/auth/IAuthRepository';
import { SignUpService } from '../services/SignUpService';
import { IUsersRepository } from '../../../repositories/users/IUsersRepository';

export const signupWithEmailHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Body: SignUpWithEmailRequestBodySchemaType;
    Reply: SignUpWithEmailResponseSuccessSchemaType;
  }
> = async (request) => {
  const opts = { logger: request.log };
  const authRepository = request.diScope.resolve<IAuthRepository>(IAuthRepository.repositoryName);
  const usersRepository = request.diScope.resolve<IUsersRepository>(IUsersRepository.repositoryName);

  const service = new SignUpService(opts, authRepository, usersRepository);

  try {
    const response = await service.signupWithEmail(request.body);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, 'Internal Server Error', { error });
  }
};
