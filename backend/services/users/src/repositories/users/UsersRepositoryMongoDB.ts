import { FastifyBaseLogger } from 'fastify';
import { IUsersRepository } from './IUsersRepository';
import { MongoClient } from 'mongodb';
import { UserCreateSchemaType, UserSchemaType } from '@falkordb/schemas/dist/global';
import { ApiError } from '@falkordb/errors';

export class UsersRepositoryMongoDB implements IUsersRepository {
  collection = this._client.db().collection('users');

  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    private _client: MongoClient,
  ) {}

  async create(params: UserCreateSchemaType): Promise<UserSchemaType> {
    try {
      const existingUser = await this.get(params.id).catch(() => null);

      if (existingUser) {
        throw ApiError.conflict('User already exists', 'USER_ALREADY_EXISTS');
      }

      const insert = {
        ...params,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await this.collection.insertOne(insert);

      return {
        id: insert.id,
        createdAt: insert.createdAt,
        updatedAt: insert.updatedAt,

        email: insert.email,
        firstName: insert.firstName,
        lastName: insert.lastName,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to create user', 'FAILED_TO_CREATE_USER');
    }
  }

  async get(id: string): Promise<UserSchemaType> {
    try {
      const response = await this.collection.findOne({ id });

      if (!response) {
        throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
      }

      return {
        id: response.id,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,

        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to get user', 'FAILED_TO_GET_USER');
    }
  }

  async update(id: string, params: UserCreateSchemaType): Promise<UserSchemaType> {
    try {
      const existingUser = await this.get(id);

      const update = {
        ...existingUser,
        ...params,
        updatedAt: new Date().toISOString(),
      };

      await this.collection.findOneAndUpdate({ id }, { $set: update });

      return {
        id: update.id,
        createdAt: update.createdAt,
        updatedAt: update.updatedAt,

        email: update.email,
        firstName: update.firstName,
        lastName: update.lastName,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to update user', 'FAILED_TO_UPDATE_USER');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.collection.findOneAndDelete({ id }, {});
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to delete user', 'FAILED_TO_DELETE_USER');
    }
  }
}
