import {
  CreateUserRequestBodySchemaType,
  CreateUserRequestParamsSchemaType,
  CreateUserResponseBodySchemaType,
} from '@falkordb/schemas/dist/services/users/v1';
import { IUsersRepository } from './IUsersRepository';
import { FastifyBaseLogger } from 'fastify';
import { FalkorDBClient } from '@falkordb/rest-client';

export class UsersRepositoryFalkorDBClient implements IUsersRepository {
  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
      client: FalkorDBClient;
    },
  ) {}

  async create(
    params: CreateUserRequestParamsSchemaType & CreateUserRequestBodySchemaType,
  ): Promise<CreateUserResponseBodySchemaType> {
    return this._opts.client.services.v1.users().users.create(
      {
        id: params.id,
      },
      {
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName,
      },
    );
  }

  async delete(id: string): Promise<void> {
    return this._opts.client.services.v1.users().users.delete({
      id,
    });
  }
}
