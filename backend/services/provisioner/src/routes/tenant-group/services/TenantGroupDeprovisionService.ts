import { ApiError } from '../../../errors/ApiError';
import { ICloudProvisionConfigsRepository } from '../../../repositories/cloud-provision-configs/ICloudProvisionConfigsRepository';
import { IOperationsRepository } from '../../../repositories/operations/IOperationsRepository';
import { OperationProviderSchemaType } from '../../../schemas/operation';
import { TenantGroupGCPProvisioner } from '../provisioners/TenantGroupGCPProvisioner';
import { FastifyBaseLogger } from 'fastify';
import { TenantGroupSchemaType, TenantGroupStatusSchemaType } from '../../../schemas/tenantGroup';
import { ITenantGroupRepository } from '../../../repositories/tenant-groups/ITenantGroupsRepository';
import { TenantGroupDeprovisionResponseSchemaType } from '../schemas/deprovision';

export class TenantGroupDeprovisionService {
  private _operationsRepository: IOperationsRepository;
  private _cloudProvisionConfigsRepository: ICloudProvisionConfigsRepository;
  private _tenantGroupRepository: ITenantGroupRepository;

  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    operationsRepository?: IOperationsRepository,
    cloudProvisionConfigsRepository?: ICloudProvisionConfigsRepository,
    tenantGroupRepository?: ITenantGroupRepository,
  ) {
    this._operationsRepository = operationsRepository;
    this._cloudProvisionConfigsRepository = cloudProvisionConfigsRepository;
    this._tenantGroupRepository = tenantGroupRepository;
  }

  async deprovisionTenantGroup(tenantGroupId: string): Promise<TenantGroupDeprovisionResponseSchemaType> {
    const tenantGroup = await this._tenantGroupRepository.get(tenantGroupId);

    if (!tenantGroup) {
      throw ApiError.notFound('Tenant group not found', 'TENANT_GROUP_NOT_FOUND');
    }

    if (tenantGroup.status !== 'ready' && tenantGroup.status !== 'provisioning-failed') {
      throw ApiError.badRequest('Tenant group is not ready', 'TENANT_GROUP_NOT_READY');
    }

    if (tenantGroup.tenants.length > 0 || tenantGroup.tenantCount > 0) {
      throw ApiError.badRequest('Tenant group has tenants', 'TENANT_GROUP_HAS_TENANTS');
    }

    await this._updateTenantGroupStatus(tenantGroupId, 'deprovisioning');

    let operationParams: {
      operationProvider: OperationProviderSchemaType;
      operationProviderId: string;
    };
    switch (tenantGroup.cloudProvider) {
      case 'gcp':
        operationParams = await this._deprovisionTenantGroupGcp(tenantGroup);
        break;
      default:
        throw ApiError.unprocessableEntity('Unsupported cloudProvider', 'UNSUPPORTED_CLOUD_PROVIDER');
    }

    const operation = await this._saveOperation(tenantGroupId, operationParams);

    return operation;
  }

  private async _deprovisionTenantGroupGcp(tenantGroup: TenantGroupSchemaType): Promise<{
    operationProvider: OperationProviderSchemaType;
    operationProviderId: string;
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

      const provisioner = new TenantGroupGCPProvisioner();

      switch (tenantGroup.clusterDeploymentVersion) {
        case 1:
          return await provisioner.deprovision(tenantGroup.id, tenantGroup.region, cloudProvisionConfig);
        default:
          throw ApiError.unprocessableEntity(
            'Unsupported clusterDeploymentVersion',
            'UNSUPPORTED_CLUSTER_DEPLOYMENT_VERSION',
          );
      }
    } catch (error) {
      await this._updateTenantGroupStatus(tenantGroup.id, 'deprovisioning-failed');
      throw error;
    }
  }

  private async _saveOperation(
    resourceId: string,
    operationParams: {
      operationProvider: OperationProviderSchemaType;
      operationProviderId: string;
    },
  ): Promise<TenantGroupDeprovisionResponseSchemaType> {
    return await this._operationsRepository.create({
      operationProvider: operationParams.operationProvider,
      operationProviderId: operationParams.operationProviderId,
      status: 'pending',
      type: 'delete',
      resourceType: 'tenant-group',
      resourceId,
    });
  }

  private async _updateTenantGroupStatus(tenantGroupId: string, status: TenantGroupStatusSchemaType): Promise<void> {
    try {
      await this._tenantGroupRepository.runTransaction<TenantGroupSchemaType>(tenantGroupId, async (tg) => {
        tg.status = status;
        return tg;
      });
    } catch (error) {
      this._opts.logger.error(error);
    }
  }
}
