import { ApiError } from '@falkordb/errors';
import { ICloudProvisionConfigsRepository } from '../../../repositories/cloud-provision-configs/ICloudProvisionConfigsRepository';
import { IOperationsRepository } from '../../../repositories/operations/IOperationsRepository';
import { OperationProviderSchemaType } from '@falkordb/schemas/src/global/operation';
import { FastifyBaseLogger } from 'fastify';
import { ITenantGroupRepository } from '../../../repositories/tenant-groups/ITenantGroupsRepository';
import ShortUniqueId from 'short-unique-id';
import { ITenantsRepository } from '../../../repositories/tenants/ITenantRepository';
import { TenantProvisionerFactory } from '../provisioners/TenantProvisioner';
import { TenantDeprovisionResponseSchemaType } from '@falkordb/schemas/src/services/provisioner/v1/tenant';
import { TenantSchemaType, TenantStatusSchemaType } from '@falkordb/schemas/src/global';

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

    const cloudProvisionConfig = await this._cloudProvisionConfigsRepository.get(tenantGroup.cloudProvisionConfigId);

    if (!cloudProvisionConfig) {
      throw ApiError.notFound('Cloud provision config not found', 'CLOUD_PROVISION_CONFIG_NOT_FOUND');
    }

    await this._updateTenantStatus(tenantId, 'deleting');

    const operationId = `op-${new ShortUniqueId({
      dictionary: 'alphanum_lower',
    }).randomUUID(16)}`;

    const provisioner = TenantProvisionerFactory.get(tenantGroup.cloudProvider);

    try {
      await provisioner.deprovision(operationId, tenant, tenantGroup, cloudProvisionConfig);
    } catch (error) {
      await this._updateTenantStatus(tenant.id, 'deleting-failed');
      throw error;
    }

    const operation = await this._saveOperation(operationId, tenant.id, {
      operationProvider: cloudProvisionConfig.cloudProviderConfig.operationProvider,
    });

    return operation;
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
