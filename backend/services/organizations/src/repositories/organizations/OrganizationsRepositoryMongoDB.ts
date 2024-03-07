import { FastifyBaseLogger } from 'fastify';
import { MongoClient, ObjectId } from 'mongodb';
import { ApiError } from '@falkordb/errors';
import { IOrganizationsRepository } from './IOrganizationsRepository';
import { CreateOrganizationType, OrganizationType, UpdateOrganizationType } from '../../schemas/organization';

export class OrganizationsRepositoryMongoDB implements IOrganizationsRepository {
  collection = this._client.db().collection('organizations');

  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    private _client: MongoClient,
  ) {}

  async create(params: CreateOrganizationType): Promise<OrganizationType> {
    try {
      const insert = {
        ...params,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await this.collection.insertOne(insert);

      return {
        id: response.insertedId.toHexString(),
        ...insert,
      };
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to create organization', 'FAILED_TO_CREATE_ORGANIZATION');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.collection.findOneAndDelete({ _id: new ObjectId(id) }, {});
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to delete organization', 'FAILED_TO_DELETE_ORGANIZATION');
    }
  }

  async get(id: string): Promise<OrganizationType> {
    try {
      const response = await this.collection.findOne({ _id: new ObjectId(id) });

      if (!response) {
        throw ApiError.notFound('Organization not found', 'ORGANIZATION_NOT_FOUND');
      }

      return {
        id: response._id.toHexString(),
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        name: response.name,
        creatorUserId: response.creatorUserId,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to get organization', 'FAILED_TO_GET_ORGANIZATION');
    }
  }

  async update(id: string, params: UpdateOrganizationType): Promise<OrganizationType> {
    try {
      const response = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...params,
            updatedAt: new Date().toISOString(),
          },
        },
        { returnDocument: 'after' },
      );

      if (!response) {
        throw ApiError.notFound('Organization not found', 'ORGANIZATION_NOT_FOUND');
      }

      return {
        id: response._id.toHexString(),
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        name: response.name,
        creatorUserId: response.creatorUserId,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to update organization', 'FAILED_TO_UPDATE_ORGANIZATION');
    }
  }
}
