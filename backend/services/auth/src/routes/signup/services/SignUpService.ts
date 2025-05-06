import { FastifyBaseLogger } from 'fastify';
import { IAuthRepository } from '../../../repositories/auth/IAuthRepository';
import { ApiError } from '@falkordb/errors';
import {
  SignUpWithEmailRequestBodySchemaType,
  SignUpWithEmailResponseSuccessSchemaType,
} from '@falkordb/schemas/services/auth/v1';
import { IUsersRepository } from '../../../repositories/users/IUsersRepository';

export class SignUpService {
  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    private authRepository: IAuthRepository,
    private usersRepository: IUsersRepository,
  ) {}

  async signupWithEmail(body: SignUpWithEmailRequestBodySchemaType): Promise<SignUpWithEmailResponseSuccessSchemaType> {
    try {
      const response = await this.authRepository.signup(body.email, body.password);

      await this.usersRepository
        .create({
          id: response.uid,
          email: body.email,
          firstName: body.firstName,
          lastName: body.lastName,
        })
        .catch(async (error) => {
          await this.authRepository.delete(response.uid);
          throw error;
        });

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
