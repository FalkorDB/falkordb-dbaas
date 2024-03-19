import { FastifyBaseLogger } from 'fastify';
import { IAuthRepository } from '../../../repositories/auth/IAuthRepository';
import { ApiError } from '@falkordb/errors';
import {
  LoginWithEmailRequestBodySchemaType,
  LoginWithEmailResponseSuccessSchemaType,
} from '@falkordb/schemas/src/services/auth/v1';

export class LoginService {
  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    private authRepository: IAuthRepository,
  ) {}

  async loginWithEmail(body: LoginWithEmailRequestBodySchemaType): Promise<LoginWithEmailResponseSuccessSchemaType> {
    try {
      const response = await this.authRepository.loginWithEmail(body.email, body.password);

      return response;
    } catch (error) {
      this._opts.logger.error(error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internalServerError('Internal Server Error', 'INTERNAL_SERVER_ERROR');
    }
  }
}
