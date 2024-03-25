import { FastifyBaseLogger, FastifyInstance } from 'fastify';
import { IAuthRepository } from '../../../repositories/auth/IAuthRepository';
import { IMessagingRepository } from '../../../repositories/messaging/IMessagingRepository';
import { ApiError } from '@falkordb/errors';

export class ForgotPasswordService {
  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
      fastify: FastifyInstance;
    },
    private _authRepository: IAuthRepository,
    private _messagingRepository: IMessagingRepository,
  ) {}

  async sendForgotPassword(params: { email: string }) {
    try {
      const { link } = await this._authRepository.createForgotPasswordLink({
        email: params.email,
        continueUrl: this._opts.fastify.config.RECOVER_PASSWORD_RETURN_URL,
      });

      await this._messagingRepository.sendRecoverPasswordEmail({
        email: params.email,
        recoverPasswordUrl: link,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      this._opts.logger.error(error, 'Error sending forgot password email');
      throw ApiError.internalServerError('Error sending forgot password email', 'INTERNAL_ERROR');
    }
  }
}
