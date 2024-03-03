import { FastifyBaseLogger } from 'fastify';
import { ITenantGroupRepository } from './ITenantGroupsRepository';
import { MongoClient } from 'mongodb';
import { TenantGroupSchemaType, TenantGroupStatusSchemaType } from '../../schemas/tenantGroup';
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
      const existingTenantGroup = await this.get(params.id).catch(() => null);

      if (existingTenantGroup) {
        throw ApiError.conflict('Tenant group already exists', 'TENANT_GROUP_ALREADY_EXISTS');
      }

      const insert = {
        ...params,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await this.collection.insertOne(insert);

      return {
        ...insert,
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
      await this.collection.findOneAndDelete({ id }, {});
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to delete tenant group', 'FAILED_TO_DELETE_TENANT_GROUP');
    }
  }

  async get(id: string): Promise<TenantGroupSchemaType> {
    try {
      const response = await this.collection.findOne({ id });

      if (!response) {
        throw ApiError.notFound('Tenant group not found', 'TENANT_GROUP_NOT_FOUND');
      }

      return {
        id: response.id,
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

  async query(params: { status?: TenantGroupStatusSchemaType }): Promise<TenantGroupSchemaType[]> {
    try {
      const query: { [key: string]: unknown } = {};

      if (params.status) {
        query.status = params.status;
      }

      const response = await this.collection.find(query).toArray();

      return response.map((item) => {
        return {
          id: item.id,
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

  runTransaction<TenantGroupSchemaType>(
    id: string,
    fn: (tenantGroup: TenantGroupSchemaType) => Promise<TenantGroupSchemaType>,
  ): Promise<TenantGroupSchemaType> {
    return new Promise<TenantGroupSchemaType>((resolve, reject) => {
      return this._client
        .withSession((session) => {
          return session.withTransaction(async () => {
            const tenantGroup = (await this.get(id)) as TenantGroupSchemaType;
            const result = await fn(tenantGroup);
            await this.collection.findOneAndUpdate(
              { id },
              {
                $set: {
                  ...result,
                  updatedAt: new Date().toISOString(),
                },
              },
            );
            resolve(result);
          });
        })
        .catch((error) => {
          this._opts.logger.error(error);
          reject(ApiError.internalServerError('Failed to run transaction', 'FAILED_TO_RUN_TRANSACTION'));
        });
    });
  }
}
