import { FastifyBaseLogger } from 'fastify';
import { IOperationsRepository } from './IOperationsRepository';

import { MongoClient } from 'mongodb';
import { ApiError } from '../../errors/ApiError';
import { CreateOperationParamsSchemaType, OperationSchemaType } from '../../schemas/operation';

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

      const response = await this.collection.insertOne(insert);

      return {
        id: response.insertedId.toHexString(),
        createdAt: insert.createdAt,
        updatedAt: insert.updatedAt,
        status: insert.status,
        type: insert.type,
        resourceType: insert.resourceType,
        resourceId: insert.resourceId,
        operationProvider: insert.operationProvider,
        operationProviderId: insert.operationProviderId,
        payload: insert.payload,
      };
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to create operation', 'FAILED_TO_CREATE_OPERATION');
    }
  }
}
