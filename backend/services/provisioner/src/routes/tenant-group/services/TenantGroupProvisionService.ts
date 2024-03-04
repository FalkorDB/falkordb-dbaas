import { ApiError } from '../../../errors/ApiError';
import { ICloudProvisionConfigsRepository } from '../../../repositories/cloud-provision-configs/ICloudProvisionConfigsRepository';
import { IOperationsRepository } from '../../../repositories/operations/IOperationsRepository';
import { OperationProviderSchemaType } from '../../../schemas/operation';
import { TenantGroupGCPProvisioner } from '../provisioners/TenantGroupGCPProvisioner';
import { TenantGroupProvisionBodySchemaType, TenantGroupProvisionResponseSchemaType } from '../schemas/provision';
import ShortUniqueId from 'short-unique-id';
import { FastifyBaseLogger, FastifyLogFn } from 'fastify';
import { ITenantGroupRepository } from '../../../repositories/tenant-groups/ITenantGroupsRepository';
import { TenantGroupSchemaType } from '../../../schemas/tenantGroup';

export class TenantGroupProvisionService {
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

  async provisionTenantGroup(
    params: TenantGroupProvisionBodySchemaType,
  ): Promise<TenantGroupProvisionResponseSchemaType> {
    let operationParams: {
      operationProvider: OperationProviderSchemaType;
    };

    const tenantGroupId = `tg-${new ShortUniqueId({
      dictionary: 'alphanum_lower',
    }).randomUUID(8)}`;

    const operationId = `op-${new ShortUniqueId({
      dictionary: 'alphanum_lower',
    }).randomUUID(16)}`;

    await this._createTenantGroup(tenantGroupId, params);

    switch (params.cloudProvider) {
      case 'gcp':
        operationParams = await this._provisionTenantGroupGcp(operationId, tenantGroupId, params);
        break;
      default:
        throw ApiError.unprocessableEntity('Unsupported cloudProvider', 'UNSUPPORTED_CLOUD_PROVIDER');
    }

    const operation = await this._saveOperation(operationId, tenantGroupId, operationParams);

    return operation;
  }

  private async _provisionTenantGroupGcp(
    operationId: string,
    tenantGroupId: string,
    params: TenantGroupProvisionBodySchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
  }> {
    try {
      const cloudProvisionConfig = await this._cloudProvisionConfigsRepository
        .query({
          cloudProvider: 'gcp',
          deploymentConfigVersion: params.clusterDeploymentVersion,
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

      switch (params.clusterDeploymentVersion) {
        case 1:
          return await provisioner.provision(operationId, tenantGroupId, params.region, cloudProvisionConfig);
        default:
          throw ApiError.unprocessableEntity(
            'Unsupported clusterDeploymentVersion',
            'UNSUPPORTED_CLUSTER_DEPLOYMENT_VERSION',
          );
      }
    } catch (error) {
      this._failTenantGroupProvisioning(tenantGroupId);
      throw error;
    }
  }

  private async _saveOperation(
    operationId: string,
    resourceId: string,
    operationParams: {
      operationProvider: OperationProviderSchemaType;
    },
  ): Promise<TenantGroupProvisionResponseSchemaType> {
    return await this._operationsRepository.create({
      id: operationId,
      operationProvider: operationParams.operationProvider,
      status: 'pending',
      type: 'create',
      resourceType: 'tenant-group',
      resourceId,
    });
  }

  private async _createTenantGroup(tenantGroupId: string, params: TenantGroupProvisionBodySchemaType): Promise<void> {
    try {
      await this._tenantGroupRepository.create({
        id: tenantGroupId,
        status: 'provisioning',
        cloudProvider: params.cloudProvider,
        clusterDeploymentVersion: params.clusterDeploymentVersion,
        region: params.region,
        schemaVersion: 1,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to create tenant group', 'FAILED_TO_CREATE_TENANT_GROUP');
    }
  }

  private async _failTenantGroupProvisioning(tenantGroupId: string): Promise<void> {
    try {
      await this._tenantGroupRepository.runTransaction<TenantGroupSchemaType>(tenantGroupId, async (tg) => {
        tg.status = 'provisioning-failed';
        return tg;
      });
    } catch (error) {
      this._opts.logger.error(error);
    }
  }
}
