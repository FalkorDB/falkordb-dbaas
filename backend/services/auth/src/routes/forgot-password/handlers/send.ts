import { SendForgotPasswordRequestBodySchemaType } from '@falkordb/schemas/src/services/auth/v1';
import { RouteHandlerMethod } from 'fastify';
import { IAuthRepository } from '../../../repositories/auth/IAuthRepository';
import { ForgotPasswordService } from '../services/ForgotPasswordService';
import { IMessagingRepository } from '../../../repositories/messaging/IMessagingRepository';
import { ApiError } from '@falkordb/errors';

export const sendForgotPasswordHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Body: SendForgotPasswordRequestBodySchemaType;
  }
> = async (request) => {
  const opts = { logger: request.log, fastify: request.server };
  const authRepository = request.diScope.resolve<IAuthRepository>(IAuthRepository.repositoryName);
  const messagingRepository = request.diScope.resolve<IMessagingRepository>(IMessagingRepository.repositoryName);

  const service = new ForgotPasswordService(opts, authRepository, messagingRepository);

  try {
    await service.sendForgotPassword(request.body);
    return;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, 'Internal Server Error', { error });
  }
};
