import { ApiError } from '../../../errors/ApiError';
import { ICloudProvisionConfigsRepository } from '../../../repositories/cloud-provision-configs/ICloudProvisionConfigsRepository';
import { IOperationsRepository } from '../../../repositories/operations/IOperationsRepository';
import ShortUniqueId from 'short-unique-id';
import { FastifyBaseLogger } from 'fastify';
import { ITenantsRepository } from '../../../repositories/tenants/ITenantRepository';
import { ITenantGroupRepository } from '../../../repositories/tenant-groups/ITenantGroupsRepository';
import { TenantProvisionBodySchemaType, TenantProvisionResponseSchemaType } from '../schemas/provision';
import { OperationProviderSchemaType } from '../../../schemas/operation';
import { TenantGroupSchemaType } from '../../../schemas/tenantGroup';
import { CloudProvisionConfigSchemaType } from '../../../schemas/cloudProvision';
import { TenantSchemaType, TenantStatusSchemaType } from '../../../schemas/tenant';
import { TenantGCPProvisioner } from '../provisioners/TenantGCPProvisioner';

export class TenantProvisionService {
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

  async provisionTenant(params: TenantProvisionBodySchemaType & { creatorUserId: string; organizationId: string }) {
    const availableTenantGroups = await this._tenantGroupRepository.query({
      status: ['ready', 'refreshing', 'upgrading', 'refreshing-failed', 'upgrading-failed'],
    });

    if (availableTenantGroups.length === 0) {
      throw ApiError.notFound('No available tenant groups', 'NO_AVAILABLE_TENANT_GROUPS');
    }

    const tenantId = `t-${new ShortUniqueId({
      dictionary: 'alphanum_lower',
    }).randomUUID(8)}`;

    const tenantGroup = await this._tenantGroupRepository.addTenantTransaction(
      {
        id: tenantId,
        name: params.name,
      },
      params.cloudProvider,
      params.region,
    );

    const tenantIdx = tenantGroup.tenants.find((t) => t.id === tenantId).position;

    const cloudProvisionConfig = await this._cloudProvisionConfigsRepository.get(tenantGroup.cloudProvisionConfigId);

    const operationId = `op-${new ShortUniqueId({
      dictionary: 'alphanum_lower',
    }).randomUUID(16)}`;

    await this._createTenant(tenantId, tenantGroup, params);

    switch (params.cloudProvider) {
      case 'gcp':
        await this._provisionTenantGcp(operationId, tenantId, tenantIdx, tenantGroup, cloudProvisionConfig, params);
        break;
      default:
        throw ApiError.unprocessableEntity('Unsupported cloudProvider', 'UNSUPPORTED_CLOUD_PROVIDER');
    }

    const operation = await this._saveOperation(operationId, tenantId, {
      operationProvider: cloudProvisionConfig.cloudProviderConfig.operationProvider,
      type: 'create',
      payload: {
        stateBucket: cloudProvisionConfig.cloudProviderConfig.stateBucket,
      },
    });

    return operation;
  }

  private async _provisionTenantGcp(
    operationId: string,
    tenantId: string,
    tenantIdx: number,
    tenantGroup: TenantGroupSchemaType,
    cloudProvisionConfig: CloudProvisionConfigSchemaType,
    params: TenantProvisionBodySchemaType,
  ): Promise<void> {
    try {
      const provisioner = new TenantGCPProvisioner();

      switch (cloudProvisionConfig.deploymentConfigVersion) {
        case 1:
          await provisioner
            .provision(operationId, tenantId, tenantIdx, tenantGroup, params, cloudProvisionConfig)
            .then((op) => op.operationProvider);
          break;
        default:
          throw ApiError.unprocessableEntity(
            'Unsupported clusterDeploymentVersion',
            'UNSUPPORTED_CLUSTER_DEPLOYMENT_VERSION',
          );
      }
    } catch (error) {
      this._failTenantProvisioning(tenantId);
      throw error;
    }
  }

  private async _failTenantProvisioning(tenantId: string): Promise<void> {
    return this._updateTenantStatus(tenantId, 'provisioning-failed');
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

  private async _saveOperation(
    operationId: string,
    resourceId: string,
    operationParams: {
      type: 'create' | 'update';
      operationProvider: OperationProviderSchemaType;
      payload: {
        stateBucket: string;
      };
    },
  ): Promise<TenantProvisionResponseSchemaType> {
    return await this._operationsRepository.create({
      id: operationId,
      operationProvider: operationParams.operationProvider,
      status: 'pending',
      type: operationParams.type,
      resourceType: 'tenant',
      resourceId,
      payload: operationParams.payload,
    });
  }

  private async _createTenant(
    tenantId: string,
    tenantGroup: TenantGroupSchemaType,
    params: TenantProvisionBodySchemaType & { creatorUserId: string; organizationId: string },
  ) {
    return await this._tenantRepository.create(tenantId, {
      name: params.name,
      cloudProvider: tenantGroup.cloudProvider,
      region: tenantGroup.region,
      tenantGroupId: tenantGroup.id,
      clusterName: tenantGroup.clusterName,
      creatorUserId: params.creatorUserId,
      organizationId: params.organizationId,
      replicationConfiguration: params.replicationConfiguration,
      status: 'provisioning',
      tierId: params.tierId,
      billingAccountId: params.billingAccountId,
      backupSchedule: params.backupSchedule,
    });
  }
}
