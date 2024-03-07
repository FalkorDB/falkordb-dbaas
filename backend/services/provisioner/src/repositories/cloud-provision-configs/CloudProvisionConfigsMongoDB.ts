import { FastifyBaseLogger } from 'fastify';
import {
  CloudProvisionConfigSchemaType,
  CreateCloudProvisionConfigParamsSchemaType,
} from '../../schemas/cloudProvision';
import { ICloudProvisionConfigsRepository } from './ICloudProvisionConfigsRepository';
import { MongoClient, ObjectId } from 'mongodb';
import { ApiError } from '@falkordb/errors';

export class CloudProvisionConfigsMongoDB implements ICloudProvisionConfigsRepository {
  collection = this._client.db().collection(this._collectionName);

  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    private _client: MongoClient,
    private _collectionName = 'cloudProvisionConfigs',
  ) {}

  async create(params: CreateCloudProvisionConfigParamsSchemaType): Promise<CloudProvisionConfigSchemaType> {
    try {
      const existingConfig = await this.query({
        cloudProvider: params.cloudProvider,
        deploymentConfigVersion: params.deploymentConfigVersion,
      });

      if (existingConfig.length > 0) {
        throw ApiError.conflict('Cloud provision config already exists', 'CLOUD_PROVISION_CONFIG_ALREADY_EXISTS');
      }

      const insert = {
        ...params,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await this.collection.insertOne(insert);

      return {
        ...insert,
        id: response.insertedId.toHexString(),
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      this._opts.logger.error(error);
      throw ApiError.internalServerError(
        'Failed to create cloud provision config',
        'FAILED_TO_CREATE_CLOUD_PROVISION_CONFIG',
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.collection.findOneAndDelete({ _id: new ObjectId(id) }, {});
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      this._opts.logger.error(error);
      throw ApiError.internalServerError(
        'Failed to delete cloud provision config',
        'FAILED_TO_DELETE_CLOUD_PROVISION_CONFIG',
      );
    }
  }

  async query(params: {
    cloudProvider?: string;
    deploymentConfigVersion?: number;
    page?: number;
    pageSize?: number;
  }): Promise<CloudProvisionConfigSchemaType[]> {
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;

      const query: { [key: string]: unknown } = {};
      if (params.cloudProvider) {
        query.cloudProvider = params.cloudProvider;
      }
      if (params.deploymentConfigVersion) {
        query.deploymentConfigVersion = params.deploymentConfigVersion;
      }

      const response = await this.collection
        .find(query, {
          limit: pageSize,
          skip: page > 0 ? (page - 1) * pageSize : 0,
        })
        .toArray();

      return response.map((config) => {
        return {
          id: config._id.toHexString(),
          createdAt: config.createdAt,
          updatedAt: config.updatedAt,
          deploymentConfigVersion: config.deploymentConfigVersion,

          cloudProvider: config.cloudProvider,
          cloudProviderConfig: config.cloudProviderConfig,

          tenantGroupConfig: config.tenantGroupConfig,
          tenantConfig: config.tenantConfig,
        };
      });
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError(
        'Failed to query cloud provision config',
        'FAILED_TO_QUERY_CLOUD_PROVISION_CONFIG',
      );
    }
  }

  async get(id: string): Promise<CloudProvisionConfigSchemaType> {
    try {
      const response = await this.collection.findOne({ _id: new ObjectId(id) });

      if (!response) {
        throw ApiError.notFound('Cloud provision config not found', 'CLOUD_PROVISION_CONFIG_NOT_FOUND');
      }

      return {
        id: response._id.toHexString(),
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        deploymentConfigVersion: response.deploymentConfigVersion,

        cloudProvider: response.cloudProvider,
        cloudProviderConfig: response.cloudProviderConfig,

        tenantGroupConfig: response.tenantGroupConfig,
        tenantConfig: response.tenantConfig,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      this._opts.logger.error(error);
      throw ApiError.internalServerError(
        'Failed to get cloud provision config',
        'FAILED_TO_GET_CLOUD_PROVISION_CONFIG',
      );
    }
  }
}
