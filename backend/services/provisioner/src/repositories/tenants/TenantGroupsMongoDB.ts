import { FastifyBaseLogger } from 'fastify';
import { ITenantsRepository } from './ITenantRepository';
import { MongoClient } from 'mongodb';
import { TenantSchemaType, TenantStatusSchemaType, CreateTenantSchemaType } from '../../schemas/tenant';
import { ApiError } from '../../errors/ApiError';

export class TenantsMongoDB implements ITenantsRepository {
  collection = this._client.db().collection('tenants');

  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    private _client: MongoClient,
  ) {}

  async create(id: string, params: CreateTenantSchemaType): Promise<TenantSchemaType> {
    try {
      const existingTenant = await this.get(id).catch(() => null);

      if (existingTenant) {
        throw ApiError.conflict('Tenant group already exists', 'TENANT_ALREADY_EXISTS');
      }

      const insert = {
        id,
        ...params,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await this.collection.insertOne(insert);

      return {
        ...insert,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to create tenant group', 'FAILED_TO_CREATE_TENANT');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.collection.findOneAndDelete({ id }, {});
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to delete tenant group', 'FAILED_TO_DELETE_TENANT');
    }
  }

  async get(id: string): Promise<TenantSchemaType> {
    try {
      const response = await this.collection.findOne({ id });

      if (!response) {
        throw ApiError.notFound('Tenant group not found', 'TENANT_NOT_FOUND');
      }

      return {
        id: response.id,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        status: response.status,
        name: response.name,
        cloudProvider: response.cloudProvider,
        clusterName: response.clusterName,
        creatorUserId: response.creatorUserId,
        domain: response.domain,
        organizationId: response.organizationId,
        region: response.region,
        replicationConfiguration: response.replicationConfiguration,
        tenantGroupId: response.tenantGroupId,
        tierId: response.tierId,
        billingAccountId: response.billingAccountId,
        backupSchedule: response.backupSchedule,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to get tenant', 'FAILED_TO_GET_TENANT');
    }
  }

  async query(params: { status?: TenantStatusSchemaType }): Promise<TenantSchemaType[]> {
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
          clusterName: item.clusterName,
          creatorUserId: item.creatorUserId,
          domain: item.domain,
          organizationId: item.organizationId,
          region: item.region,
          replicationConfiguration: item.replicationConfiguration,
          tenantGroupId: item.tenantGroupId,
          tierId: item.tierId,
          billingAccountId: item.billingAccountId,
          name: item.name,
          backupSchedule: item.backupSchedule,
        };
      });
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to query tenant group', 'FAILED_TO_QUERY_TENANT');
    }
  }

  runTransaction<TenantSchemaType>(
    id: string,
    fn: (tenant: TenantSchemaType) => Promise<TenantSchemaType>,
  ): Promise<TenantSchemaType> {
    return new Promise<TenantSchemaType>((resolve, reject) => {
      return this._client
        .withSession((session) => {
          return session.withTransaction(async () => {
            const tenant = (await this.get(id)) as TenantSchemaType;
            const result = await fn(tenant);
            const after = await this.collection.findOneAndUpdate(
              { id },
              {
                $set: {
                  ...result,
                  updatedAt: new Date().toISOString(),
                },
              },
              {
                returnDocument: 'after',
              },
            );
            resolve({
              ...after,
              id: after.id,
            } as TenantSchemaType);
          });
        })
        .catch((error) => {
          this._opts.logger.error(error);
          reject(ApiError.internalServerError('Failed to run transaction', 'FAILED_TO_RUN_TRANSACTION'));
        });
    });
  }
}
