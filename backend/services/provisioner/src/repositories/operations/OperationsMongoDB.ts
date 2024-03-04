import { FastifyBaseLogger } from 'fastify';
import { IOperationsRepository } from './IOperationsRepository';

import { MongoClient, ObjectId } from 'mongodb';
import { ApiError } from '../../errors/ApiError';
import {
  CreateOperationParamsSchemaType,
  OperationSchemaType,
  OperationStatusSchemaType,
} from '../../schemas/operation';

export class OperationsMongoDB implements IOperationsRepository {
  collection = this._client.db().collection('operations');

  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    private _client: MongoClient,
  ) {}

  async create(params: CreateOperationParamsSchemaType): Promise<OperationSchemaType> {
    try {
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
        status: insert.status,
        type: insert.type,
        resourceType: insert.resourceType,
        resourceId: insert.resourceId,
        operationProvider: insert.operationProvider,
        payload: insert.payload,
      };
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to create operation', 'FAILED_TO_CREATE_OPERATION');
    }
  }

  async get(id: string): Promise<OperationSchemaType | null> {
    try {
      const response = await this.collection.findOne({ id });

      if (!response) {
        return null;
      }

      return {
        id: response.id,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        status: response.status,
        type: response.type,
        resourceType: response.resourceType,
        resourceId: response.resourceId,
        operationProvider: response.operationProvider,
        payload: response.payload,
      };
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to get operation', 'FAILED_TO_GET_OPERATION');
    }
  }

  async updateStatus(id: string, status: OperationStatusSchemaType): Promise<OperationSchemaType> {
    try {
      const response = await this.collection.findOneAndUpdate(
        { id },
        { $set: { status, updatedAt: new Date().toISOString() } },
        { returnDocument: 'after' },
      );

      return {
        id: response.id,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        status: response.status,
        type: response.type,
        resourceType: response.resourceType,
        resourceId: response.resourceId,
        operationProvider: response.operationProvider,
        payload: response.payload,
      };
    } catch (error) {
      this._opts.logger.error(error, 'Failed to update operation', id);
      throw ApiError.internalServerError('Failed to update operation', 'FAILED_TO_UPDATE_OPERATION');
    }
  }
}
