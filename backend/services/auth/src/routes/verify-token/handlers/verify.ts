import { ApiError } from '@falkordb/errors';
import {
  VerifyTokenRequestQuerySchemaType,
  VerifyTokenResponseSuccessSchemaType,
} from '@falkordb/schemas/services/auth/v1';
import { RouteHandlerMethod } from 'fastify';
import { IAuthRepository } from '../../../repositories/auth/IAuthRepository';

export const verifyTokenHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Querystring: VerifyTokenRequestQuerySchemaType;
    Reply: VerifyTokenResponseSuccessSchemaType;
  }
> = async (request) => {
  try {
    const repository = request.diScope.resolve<IAuthRepository>(IAuthRepository.repositoryName);
    const response = await repository.verifyToken(request.query.token);

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, 'Internal Server Error', { error });
  }
};
