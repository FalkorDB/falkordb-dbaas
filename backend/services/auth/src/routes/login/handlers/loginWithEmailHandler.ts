import {
  LoginWithEmailRequestBodySchemaType,
  LoginWithEmailResponseSuccessSchemaType,
} from '@falkordb/schemas/dist/services/auth/v1';
import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import { IAuthRepository } from '../../../repositories/auth/IAuthRepository';
import { LoginService } from '../services/LoginService';

export const loginWithEmailHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Body: LoginWithEmailRequestBodySchemaType;
    Reply: LoginWithEmailResponseSuccessSchemaType;
  }
> = async (request) => {
  const opts = { logger: request.log };
  const repository = request.diScope.resolve<IAuthRepository>(IAuthRepository.repositoryName);

  const service = new LoginService(opts, repository);

  try {
    const response = await service.loginWithEmail(request.body);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, 'Internal Server Error', { error });
  }
};
