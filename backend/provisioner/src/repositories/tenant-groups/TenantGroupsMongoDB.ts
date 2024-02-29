import { FastifyBaseLogger } from 'fastify';
import { ITenantGroupRepository } from './ITenantGroupsRepository';
import { MongoClient } from 'mongodb';
import { TenantGroupSchemaType } from '../../schemas/tenantGroup';
import { ApiError } from '../../errors/ApiError';

export class TenantGroupsMongoDB implements ITenantGroupRepository {
  collection = this._client.db().collection('tenantGroups');

  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    private _client: MongoClient,
  ) {}

  async create(params: TenantGroupSchemaType): Promise<TenantGroupSchemaType> {
    try {
      const existingTenantGroup = await this.get(params.id);

      if (existingTenantGroup) {
        throw ApiError.conflict('Tenant group already exists', 'TENANT_GROUP_ALREADY_EXISTS');
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
        tenantCount: 0,
        tenants: [],
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to create tenant group', 'FAILED_TO_CREATE_TENANT_GROUP');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.collection.findOneAndDelete({ _id: new MongoClient(id) }, {});
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to delete tenant group', 'FAILED_TO_DELETE_TENANT_GROUP');
    }
  }

  async get(id: string): Promise<TenantGroupSchemaType> {
    try {
      const response = await this.collection.findOne({ _id: new MongoClient(id) });

      if (!response) {
        throw ApiError.notFound('Tenant group not found', 'TENANT_GROUP_NOT_FOUND');
      }

      return {
        id: response._id.toHexString(),
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        status: response.status,
        cloudProvider: response.cloudProvider,
        clusterDeploymentVersion: response.clusterDeploymentVersion,
        cloudProvisionConfigId: response.cloudProvisionConfigId,
        clusterDomain: response.clusterDomain,
        region: response.region,
        clusterName: response.clusterName,
        schemaVersion: response.schemaVersion,
        tenantCount: response.tenantCount,
        tenants: response.tenants,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to get tenant group', 'FAILED_TO_GET_TENANT_GROUP');
    }
  }

  async query(params: { id?: string }): Promise<TenantGroupSchemaType[]> {
    try {
      const response = await this.collection.find(params).toArray();

      return response.map((item) => {
        return {
          id: item._id.toHexString(),
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          status: item.status,
          cloudProvider: item.cloudProvider,
          clusterDeploymentVersion: item.clusterDeploymentVersion,
          cloudProvisionConfigId: item.cloudProvisionConfigId,
          clusterDomain: item.clusterDomain,
          region: item.region,
          clusterName: item.clusterName,
          schemaVersion: item.schemaVersion,
          tenantCount: item.tenantCount,
          tenants: item.tenants,
        };
      });
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to query tenant group', 'FAILED_TO_QUERY_TENANT_GROUP');
    }
  }

  runTransaction<T>(
    id: string,
    fn: (tenantGroup: TenantGroupSchemaType, commit: (tenantGroup: TenantGroupSchemaType) => void) => Promise<T>,
  ): Promise<T> {
    return this._client.withSession(async (session) => {
      return await session.withTransaction(async () => {
        const tenantGroup = await this.get(id);
        return await fn(tenantGroup[0], async (updatedTenantGroup) => {
          await this.collection.updateOne(
            { _id: new MongoClient(id) },
            {
              $set: {
                ...updatedTenantGroup,
                updatedAt: new Date().toISOString(),
              },
            },
            { session },
          );
        });
      });
    });
  }
}
