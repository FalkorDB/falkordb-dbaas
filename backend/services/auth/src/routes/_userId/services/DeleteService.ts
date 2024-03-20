import { FastifyBaseLogger } from 'fastify';
import { IAuthRepository } from '../../../repositories/auth/IAuthRepository';
import { ApiError } from '@falkordb/errors';
import {
  SignUpWithEmailRequestBodySchemaType,
  SignUpWithEmailResponseSuccessSchemaType,
} from '@falkordb/schemas/dist/services/auth/v1';
import { IUsersRepository } from '../../../repositories/users/IUsersRepository';

export class DeleteService {
  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    private authRepository: IAuthRepository,
    private usersRepository: IUsersRepository,
  ) {}

  async delete(userId: string): Promise<void> {
    try {
      const responses = await Promise.allSettled([
        this.authRepository.delete(userId),
        this.usersRepository.delete(userId),
      ]);

      if (responses.some((response) => response.status === 'rejected')) {
        if (responses.some((response) => (response as PromiseRejectedResult).reason instanceof ApiError)) {
          throw (
            responses.find(
              (response) => (response as PromiseRejectedResult).reason instanceof ApiError,
            ) as PromiseRejectedResult
          ).reason;
        }
        throw ApiError.internalServerError('Error deleting user', 'AUTH_DELETE_USER_ERROR');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      this._opts.logger.error(error, 'Error deleting user');
      throw ApiError.internalServerError('Error deleting user', 'AUTH_DELETE_USER_ERROR');
    }
  }
}
