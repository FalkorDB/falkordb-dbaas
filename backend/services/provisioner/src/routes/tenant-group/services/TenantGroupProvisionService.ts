import { ApiError } from '@falkordb/errors';
import { ICloudProvisionConfigsRepository } from '../../../repositories/cloud-provision-configs/ICloudProvisionConfigsRepository';
import { IOperationsRepository } from '../../../repositories/operations/IOperationsRepository';
import { OperationProviderSchemaType } from '../../../schemas/operation';
import { TenantGroupGCPProvisioner } from '../provisioners/TenantGroupGCPProvisioner';
import { TenantGroupProvisionBodySchemaType, TenantGroupProvisionResponseSchemaType } from '../schemas/provision';
import ShortUniqueId from 'short-unique-id';
import { FastifyBaseLogger, FastifyLogFn } from 'fastify';
import { ITenantGroupRepository } from '../../../repositories/tenant-groups/ITenantGroupsRepository';
import { TenantGroupSchemaType, TenantGroupStatusSchemaType } from '../../../schemas/tenantGroup';
import { SupportedCloudProviderSchemaType } from '../../../schemas/global';
import { CloudProvisionConfigSchemaType } from '../../../schemas/cloudProvision';
import { TenantGroupRefreshParamsSchemaType, TenantGroupRefreshResponseSchemaType } from '../schemas/refresh';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

export class TenantGroupProvisionService {
  private _operationsRepository: IOperationsRepository;
  private _cloudProvisionConfigsRepository: ICloudProvisionConfigsRepository;
  private _tenantGroupRepository: ITenantGroupRepository;

  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    operationsRepository: IOperationsRepository,
    cloudProvisionConfigsRepository: ICloudProvisionConfigsRepository,
    tenantGroupRepository: ITenantGroupRepository,
  ) {
    this._operationsRepository = operationsRepository;
    this._cloudProvisionConfigsRepository = cloudProvisionConfigsRepository;
    this._tenantGroupRepository = tenantGroupRepository;
  }

  async provisionTenantGroup(
    params: TenantGroupProvisionBodySchemaType,
  ): Promise<TenantGroupProvisionResponseSchemaType> {
    const cloudProvisionConfig = await this._getCloudProvisionConfig(
      params.cloudProvider,
      params.clusterDeploymentVersion,
    );

    const tenantGroupId = `${uniqueNamesGenerator({
      dictionaries: [['tg'], adjectives, animals],
      separator: '-',
      style: 'lowerCase',
      length: 3,
    })}`;

    const operationId = `op-${new ShortUniqueId({
      dictionary: 'alphanum_lower',
    }).randomUUID(16)}`;

    await this._createTenantGroup(tenantGroupId, { ...params, cloudProvisionConfigId: cloudProvisionConfig.id });

    switch (params.cloudProvider) {
      case 'gcp':
        await this._provisionTenantGroupGcp(operationId, tenantGroupId, cloudProvisionConfig, params);
        break;
      default:
        throw ApiError.unprocessableEntity('Unsupported cloudProvider', 'UNSUPPORTED_CLOUD_PROVIDER');
    }

    const operation = await this._saveOperation(operationId, tenantGroupId, {
      operationProvider: cloudProvisionConfig.cloudProviderConfig.operationProvider,
      type: 'create',
      payload: {
        stateBucket: cloudProvisionConfig.cloudProviderConfig.stateBucket,
      },
    });

    return operation;
  }

  private async _getCloudProvisionConfig(
    cloudProvider: SupportedCloudProviderSchemaType,
    deploymentConfigVersion: number,
  ): Promise<CloudProvisionConfigSchemaType> {
    try {
      const configs = await this._cloudProvisionConfigsRepository.query({
        cloudProvider,
        deploymentConfigVersion,
      });
      if (configs.length === 0) {
        throw ApiError.notFound('Cloud provision config not found', 'CLOUD_PROVISION_CONFIG_NOT_FOUND');
      }

      // Sort by date desc
      configs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return configs[0];
    } catch (err) {
      this._opts.logger.error(err);
      throw ApiError.internalServerError(
        'Failed to query cloud provision config',
        'FAILED_TO_QUERY_CLOUD_PROVISION_CONFIG',
      );
    }
  }

  private async _provisionTenantGroupGcp(
    operationId: string,
    tenantGroupId: string,
    cloudProvisionConfig: CloudProvisionConfigSchemaType,
    params: TenantGroupProvisionBodySchemaType,
  ): Promise<void> {
    try {
      const provisioner = new TenantGroupGCPProvisioner();

      switch (cloudProvisionConfig.deploymentConfigVersion) {
        case 1:
          await provisioner
            .provision(operationId, tenantGroupId, params.region, cloudProvisionConfig)
            .then((op) => op.operationProvider);
          break;
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

  private async _refreshTenantGroupGcp(
    operationId: string,
    tenantGroup: TenantGroupSchemaType,
    cloudProvisionConfig: CloudProvisionConfigSchemaType,
  ): Promise<void> {
    try {
      const provisioner = new TenantGroupGCPProvisioner();

      switch (cloudProvisionConfig.deploymentConfigVersion) {
        case 1:
          await provisioner
            .refresh(operationId, tenantGroup.id, tenantGroup.region, cloudProvisionConfig)
            .then((op) => op.operationProvider);
          break;
        default:
          throw ApiError.unprocessableEntity(
            'Unsupported clusterDeploymentVersion',
            'UNSUPPORTED_CLUSTER_DEPLOYMENT_VERSION',
          );
      }
    } catch (error) {
      this._failTenantGroupRefresh(tenantGroup.id);
      throw error;
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
  ): Promise<TenantGroupProvisionResponseSchemaType> {
    return await this._operationsRepository.create({
      id: operationId,
      operationProvider: operationParams.operationProvider,
      status: 'pending',
      type: operationParams.type,
      resourceType: 'tenant-group',
      resourceId,
      payload: operationParams.payload,
    });
  }

  private async _createTenantGroup(
    tenantGroupId: string,
    params: TenantGroupProvisionBodySchemaType & { cloudProvisionConfigId: string },
  ): Promise<void> {
    try {
      await this._tenantGroupRepository.create({
        id: tenantGroupId,
        status: 'provisioning',
        cloudProvider: params.cloudProvider,
        clusterDeploymentVersion: params.clusterDeploymentVersion,
        cloudProvisionConfigId: params.cloudProvisionConfigId,
        region: params.region,
        schemaVersion: 1,
        maxTenants: parseInt(`${process.env.DEFAULT_MAX_TENANTS_PER_TENANT_GROUP ?? 20}`, 10),
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
    return this._updateTenantGroupStatus(tenantGroupId, 'provisioning-failed');
  }

  private async _failTenantGroupRefresh(tenantGroupId: string): Promise<void> {
    return this._updateTenantGroupStatus(tenantGroupId, 'refreshing-failed');
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

  async refreshTenantGroup(params: TenantGroupRefreshParamsSchemaType): Promise<TenantGroupRefreshResponseSchemaType> {
    const tenantGroup = await this._tenantGroupRepository.get(params.id);

    if (!tenantGroup) {
      throw ApiError.notFound('Tenant group not found', 'TENANT_GROUP_NOT_FOUND');
    }

    if (tenantGroup.status !== 'ready') {
      throw ApiError.unprocessableEntity('Tenant group must be in ready status', 'TENANT_GROUP_NOT_READY');
    }

    const cloudProvisionConfig = await this._cloudProvisionConfigsRepository.get(tenantGroup.cloudProvisionConfigId);

    if (!cloudProvisionConfig) {
      throw ApiError.notFound('Cloud provision config not found', 'CLOUD_PROVISION_CONFIG_NOT_FOUND');
    }

    const operationId = `op-${new ShortUniqueId({
      dictionary: 'alphanum_lower',
    }).randomUUID(16)}`;

    await this._updateTenantGroupStatus(tenantGroup.id, 'refreshing');

    switch (tenantGroup.cloudProvider) {
      case 'gcp':
        await this._refreshTenantGroupGcp(operationId, tenantGroup, cloudProvisionConfig);
        break;
      default:
        throw ApiError.unprocessableEntity('Unsupported cloudProvider', 'UNSUPPORTED_CLOUD_PROVIDER');
    }

    const operation = await this._saveOperation(operationId, tenantGroup.id, {
      operationProvider: cloudProvisionConfig.cloudProviderConfig.operationProvider,
      type: 'update',
      payload: {
        stateBucket: cloudProvisionConfig.cloudProviderConfig.stateBucket,
      },
    });

    return operation;
  }
}
