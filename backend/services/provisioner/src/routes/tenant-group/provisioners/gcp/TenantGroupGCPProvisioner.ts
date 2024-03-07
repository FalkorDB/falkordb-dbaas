import { ApiError } from '@falkordb/errors';
import { CloudProvisionGCPConfigSchemaType } from '../../../../schemas/cloudProvision';
import { SupportedRegionsSchemaType } from '../../../../schemas/global';
import { OperationProviderSchemaType } from '../../../../schemas/operation';
import { TenantGroupSchemaType } from '../../../../schemas/tenantGroup';
import { TenantGroupProvisioner } from '../TenantGroupProvisioner';
import { TenantGroupGCPProvisionerV1 } from './TenantGroupGCPProvisionerV1';

export class TenantGroupGCPProvisioner implements TenantGroupProvisioner {
  static provisionerVersions = {
    1: TenantGroupGCPProvisionerV1,
  };

  provision(
    operationId: string,
    tenantGroupId: string,
    region: SupportedRegionsSchemaType,
    cloudProvisionConfig: CloudProvisionGCPConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
  }> {
    switch (cloudProvisionConfig.deploymentConfigVersion) {
      case 1:
        return new TenantGroupGCPProvisioner.provisionerVersions[1]().provision(
          operationId,
          tenantGroupId,
          region,
          cloudProvisionConfig,
        );
      default:
        throw ApiError.unprocessableEntity(
          'Unsupported deploymentConfigVersion',
          'UNSUPPORTED_DEPLOYMENT_CONFIG_VERSION',
        );
    }
  }

  deprovision(
    operationId: string,
    tenantGroup: TenantGroupSchemaType,
    region: SupportedRegionsSchemaType,
    cloudProvisionConfig: CloudProvisionGCPConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
  }> {
    switch (cloudProvisionConfig.deploymentConfigVersion) {
      case 1:
        return new TenantGroupGCPProvisioner.provisionerVersions[1]().deprovision(
          operationId,
          tenantGroup,
          region,
          cloudProvisionConfig,
        );
      default:
        throw ApiError.unprocessableEntity(
          'Unsupported deploymentConfigVersion',
          'UNSUPPORTED_DEPLOYMENT_CONFIG_VERSION',
        );
    }
  }

  refresh(
    operationId: string,
    tenantGroupId: string,
    region: SupportedRegionsSchemaType,
    cloudProvisionConfig: CloudProvisionGCPConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
  }> {
    switch (cloudProvisionConfig.deploymentConfigVersion) {
      case 1:
        return new TenantGroupGCPProvisioner.provisionerVersions[1]().refresh(
          operationId,
          tenantGroupId,
          region,
          cloudProvisionConfig,
        );
      default:
        throw ApiError.unprocessableEntity(
          'Unsupported deploymentConfigVersion',
          'UNSUPPORTED_DEPLOYMENT_CONFIG_VERSION',
        );
    }
  }
}
