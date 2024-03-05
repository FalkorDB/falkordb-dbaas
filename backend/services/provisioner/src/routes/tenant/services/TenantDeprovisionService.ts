import { ApiError } from '../../../errors/ApiError';
import { ICloudProvisionConfigsRepository } from '../../../repositories/cloud-provision-configs/ICloudProvisionConfigsRepository';
import { IOperationsRepository } from '../../../repositories/operations/IOperationsRepository';
import { OperationProviderSchemaType } from '../../../schemas/operation';
import { FastifyBaseLogger } from 'fastify';
import { TenantGroupSchemaType, TenantGroupStatusSchemaType } from '../../../schemas/tenantGroup';
import { ITenantGroupRepository } from '../../../repositories/tenant-groups/ITenantGroupsRepository';
import ShortUniqueId from 'short-unique-id';
import { ITenantsRepository } from '../../../repositories/tenants/ITenantRepository';
import { TenantDeprovisionResponseSchemaType } from '../schemas/deprovision';
import { TenantSchemaType, TenantStatusSchemaType } from '../../../schemas/tenant';
import { TenantGCPProvisioner } from '../provisioners/TenantGCPProvisioner';

export class TenantDeprovisionService {
  private _operationsRepository: IOperationsRepository;
  private _cloudProvisionConfigsRepository: ICloudProvisionConfigsRepository;
  private _tenantGroupRepository: ITenantGroupRepository;
  private _tenantRepository: ITenantsRepository;

  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    operationsRepository: IOperationsRepository,
    cloudProvisionConfigsRepository: ICloudProvisionConfigsRepository,
    tenantGroupRepository: ITenantGroupRepository,
    tenantRepository: ITenantsRepository,
  ) {
    this._operationsRepository = operationsRepository;
    this._cloudProvisionConfigsRepository = cloudProvisionConfigsRepository;
    this._tenantGroupRepository = tenantGroupRepository;
    this._tenantRepository = tenantRepository;
  }

  async deprovisionTenant(tenantId: string): Promise<TenantDeprovisionResponseSchemaType> {
    const tenant = await this._tenantRepository.get(tenantId);

    if (!tenant) {
      throw ApiError.notFound('Tenant not found', 'TENANT_NOT_FOUND');
    }

    if (tenant.status !== 'ready' && tenant.status !== 'provisioning-failed' && tenant.status !== 'deleting-failed') {
      throw ApiError.badRequest('Tenant is not ready', 'TENANT_NOT_READY');
    }

    const tenantGroup = await this._tenantGroupRepository.get(tenant.tenantGroupId);

    if (!tenantGroup) {
      throw ApiError.notFound('Tenant group not found', 'TENANT_GROUP_NOT_FOUND');
    }

    await this._updateTenantStatus(tenantId, 'deleting');

    const operationId = `op-${new ShortUniqueId({
      dictionary: 'alphanum_lower',
    }).randomUUID(16)}`;

    let operationParams: {
      operationProvider: OperationProviderSchemaType;
    };
    switch (tenantGroup.cloudProvider) {
      case 'gcp':
        operationParams = await this._deprovisionTenantGroupGcp(operationId, tenant, tenantGroup);
        break;
      default:
        throw ApiError.unprocessableEntity('Unsupported cloudProvider', 'UNSUPPORTED_CLOUD_PROVIDER');
    }

    const operation = await this._saveOperation(operationId, tenant.id, operationParams);

    return operation;
  }

  private async _deprovisionTenantGroupGcp(
    operationId: string,
    tenant: TenantSchemaType,
    tenantGroup: TenantGroupSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
  }> {
    try {
      const cloudProvisionConfig = await this._cloudProvisionConfigsRepository
        .query({
          cloudProvider: 'gcp',
          deploymentConfigVersion: tenantGroup.clusterDeploymentVersion,
        })
        .then((configs) => {
          if (configs.length === 0) {
            throw ApiError.notFound('Cloud provision config not found', 'CLOUD_PROVISION_CONFIG_NOT_FOUND');
          }

          // Sort by date desc
          configs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          return configs[0];
        })
        .catch((err) => {
          this._opts.logger.error(err);
          throw ApiError.internalServerError(
            'Failed to query cloud provision config',
            'FAILED_TO_QUERY_CLOUD_PROVISION_CONFIG',
          );
        });

      const provisioner = new TenantGCPProvisioner();

      switch (tenantGroup.clusterDeploymentVersion) {
        case 1:
          return await provisioner.deprovision(operationId, tenant, tenantGroup, cloudProvisionConfig);
        default:
          throw ApiError.unprocessableEntity(
            'Unsupported clusterDeploymentVersion',
            'UNSUPPORTED_CLUSTER_DEPLOYMENT_VERSION',
          );
      }
    } catch (error) {
      await this._updateTenantStatus(tenantGroup.id, 'deleting-failed');
      throw error;
    }
  }

  private async _saveOperation(
    operationId: string,
    resourceId: string,
    operationParams: {
      operationProvider: OperationProviderSchemaType;
    },
  ): Promise<TenantDeprovisionResponseSchemaType> {
    return await this._operationsRepository.create({
      id: operationId,
      operationProvider: operationParams.operationProvider,
      status: 'pending',
      type: 'delete',
      resourceType: 'tenant',
      resourceId,
    });
  }

  private async _updateTenantStatus(tenantId: string, status: TenantStatusSchemaType): Promise<void> {
    try {
      await this._tenantRepository.runTransaction<TenantSchemaType>(tenantId, async (tg) => {
        tg.status = status;
        return tg;
      });
    } catch (error) {
      this._opts.logger.error(error);
    }
  }
}
