import {
  SignUpWithEmailRequestBodySchemaType,
  SignUpWithEmailResponseSuccessSchemaType,
} from '@falkordb/schemas/src/services/auth/v1';
import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import { IAuthRepository } from '../../../repositories/auth/IAuthRepository';
import { SignUpService } from '../services/SignUpService';

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
  const repository = request.diScope.resolve<IAuthRepository>(IAuthRepository.repositoryName);

  const service = new SignUpService(opts, repository);

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
