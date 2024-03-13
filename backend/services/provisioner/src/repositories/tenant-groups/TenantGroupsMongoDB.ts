import { FastifyBaseLogger } from 'fastify';
import { ITenantGroupRepository } from './ITenantGroupsRepository';
import { MongoClient } from 'mongodb';
import { TenantGroupSchemaType, TenantGroupStatusSchemaType } from '@falkordb/schemas/src/global/tenantGroup';
import { ApiError } from '@falkordb/errors';
import { SupportedCloudProviderSchemaType, SupportedRegionsSchemaType } from '@falkordb/schemas/src/global';

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
        maxTenants: response.maxTenants,
        backupBucketName: response.backupBucketName,
        clusterCaCertificate: response.clusterCaCertificate,
        clusterEndpoint: response.clusterEndpoint,
        ipAddress: response.ipAddress,
        vpcName: response.vpcName,
        veleroGcpSaId: response.veleroGcpSaId,
        veleroGcpSaEmail: response.veleroGcpSaEmail,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to get tenant group', 'FAILED_TO_GET_TENANT_GROUP');
    }
  }

  async query(params: {
    status?: TenantGroupStatusSchemaType[];
    cloudProvider?: SupportedCloudProviderSchemaType;
    region?: SupportedRegionsSchemaType;
  }): Promise<TenantGroupSchemaType[]> {
    try {
      const query: { [key: string]: unknown } = {};

      if (params.status) {
        query.status = { $in: params.status };
      }

      if (params.cloudProvider) {
        query.cloudProvider = params.cloudProvider;
      }

      if (params.region) {
        query.region = params.region;
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
          maxTenants: item.maxTenants,
          backupBucketName: item.backupBucketName,
          clusterCaCertificate: item.clusterCaCertificate,
          clusterEndpoint: item.clusterEndpoint,
          ipAddress: item.ipAddress,
          vpcName: item.vpcName,
          veleroGcpSaId: item.veleroGcpSaId,
          veleroGcpSaEmail: item.veleroGcpSaEmail,
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
            } as TenantGroupSchemaType);
          });
        })
        .catch((error) => {
          this._opts.logger.error(error);
          reject(ApiError.internalServerError('Failed to run transaction', 'FAILED_TO_RUN_TRANSACTION'));
        });
    });
  }

  addTenantTransaction(
    tenant: { id: string; name: string },
    cloudProvider: SupportedCloudProviderSchemaType,
    region: SupportedRegionsSchemaType,
  ): Promise<TenantGroupSchemaType> {
    return new Promise<TenantGroupSchemaType>((resolve, reject) => {
      return this._client
        .withSession((session) => {
          return session.withTransaction(async () => {
            const tenantGroups = await this.query({
              status: ['ready', 'refreshing', 'upgrading', 'refreshing-failed', 'upgrading-failed'],
              cloudProvider,
              region,
            });

            if (tenantGroups.length === 0) {
              throw ApiError.notFound('Tenant group not found', 'TENANT_GROUP_NOT_FOUND');
            }

            for (const tenantGroup of tenantGroups) {
              if (tenantGroup.tenantCount >= tenantGroup.maxTenants) continue;

              const _findFirstAvailablePosition = (tenants: { position: number }[]) => {
                const positions = tenants.map((tenant) => tenant.position).sort((a, b) => a - b);
                for (let i = 0; i < positions.length; i++) {
                  if (positions[i] !== i) return i;
                }
                return positions.length;
              };

              const position = _findFirstAvailablePosition(tenantGroup.tenants);

              tenantGroup.tenantCount += 1;
              tenantGroup.tenants.push({
                id: tenant.id,
                name: tenant.name,
                position,
              });
              const after = await this.collection.findOneAndUpdate(
                { id: tenantGroup.id },
                {
                  $set: {
                    ...tenantGroup,
                    updatedAt: new Date().toISOString(),
                  },
                },
                {
                  returnDocument: 'after',
                },
              );
              resolve({
                id: after.id,
                createdAt: after.createdAt,
                updatedAt: after.updatedAt,
                status: after.status,
                cloudProvider: after.cloudProvider,
                clusterDeploymentVersion: after.clusterDeploymentVersion,
                cloudProvisionConfigId: after.cloudProvisionConfigId,
                clusterDomain: after.clusterDomain,
                region: after.region,
                clusterName: after.clusterName,
                schemaVersion: after.schemaVersion,
                tenantCount: after.tenantCount,
                tenants: after.tenants,
                maxTenants: after.maxTenants,
                backupBucketName: after.backupBucketName,
                clusterCaCertificate: after.clusterCaCertificate,
                clusterEndpoint: after.clusterEndpoint,
                ipAddress: after.ipAddress,
                vpcName: after.vpcName,
                veleroGcpSaId: after.veleroGcpSaId,
                veleroGcpSaEmail: after.veleroGcpSaEmail,
              });
            }
          });
        })
        .catch((error) => {
          this._opts.logger.error(error);
          reject(
            ApiError.internalServerError(
              'Failed to add tenant to tenant group',
              'FAILED_TO_ADD_TENANT_TO_TENANT_GROUP',
            ),
          );
        });
    });
  }

  removeTenantTransaction(tenantId: string): Promise<TenantGroupSchemaType> {
    return new Promise<TenantGroupSchemaType>((resolve, reject) => {
      return this._client
        .withSession((session) => {
          return session.withTransaction(async () => {
            const tenantGroup = await this.collection
              .aggregate(
                [
                  {
                    $match: {
                      tenants: {
                        $elemMatch: {
                          id: tenantId,
                        },
                      },
                    },
                  },
                ],
                { session },
              )
              .next();

            if (!tenantGroup) {
              throw ApiError.notFound('Tenant group not found', 'TENANT_GROUP_NOT_FOUND');
            }

            tenantGroup.tenantCount -= 1;
            tenantGroup.tenants = (tenantGroup.tenants ?? []).filter((tenant) => tenant.id !== tenantId);

            const after = await this.collection.findOneAndUpdate(
              { id: tenantGroup.id },
              {
                $set: {
                  ...tenantGroup,
                  updatedAt: new Date().toISOString(),
                },
              },
              {
                returnDocument: 'after',
                session,
              },
            );

            resolve({
              id: after.id,
              createdAt: after.createdAt,
              updatedAt: after.updatedAt,
              status: after.status,
              cloudProvider: after.cloudProvider,
              clusterDeploymentVersion: after.clusterDeploymentVersion,
              cloudProvisionConfigId: after.cloudProvisionConfigId,
              clusterDomain: after.clusterDomain,
              region: after.region,
              clusterName: after.clusterName,
              schemaVersion: after.schemaVersion,
              tenantCount: after.tenantCount,
              tenants: after.tenants,
              maxTenants: after.maxTenants,
              backupBucketName: after.backupBucketName,
              clusterCaCertificate: after.clusterCaCertificate,
              clusterEndpoint: after.clusterEndpoint,
              ipAddress: after.ipAddress,
              vpcName: after.vpcName,
              veleroGcpSaId: after.veleroGcpSaId,
              veleroGcpSaEmail: after.veleroGcpSaEmail,
            });
          });
        })
        .catch((error) => {
          this._opts.logger.error(error);
          reject(
            ApiError.internalServerError(
              'Failed to remove tenant from tenant group',
              'FAILED_TO_REMOVE_TENANT_FROM_TENANT_GROUP',
            ),
          );
        });
    });
  }
}
