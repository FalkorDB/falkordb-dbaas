import { ApiError } from '@falkordb/errors';
import { CloudProvisionGCPConfigSchemaType } from '../../../../schemas/cloudProvision';
import { OperationProviderSchemaType } from '../../../../schemas/operation';
import { TenantSchemaType } from '../../../../schemas/tenant';
import { TenantGroupSchemaType } from '../../../../schemas/tenantGroup';
import { TenantProvisionBodySchemaType } from '../../schemas/provision';
import { TenantProvisioner } from '../TenantProvisioner';
import { TenantGCPProvisionerV1 } from './TenantGCPProvisionerV1';

export class TenantGCPProvisioner implements TenantProvisioner {
  static provisionerVersions = {
    1: TenantGCPProvisionerV1,
  };

  provision(
    operationId: string,
    tenantId: string,
    tenantIdx: number,
    tenantGroup: TenantGroupSchemaType,
    params: TenantProvisionBodySchemaType,
    cloudProvisionConfig: CloudProvisionGCPConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
  }> {
    switch (cloudProvisionConfig.deploymentConfigVersion) {
      case 1:
        return new TenantGCPProvisioner.provisionerVersions[1]().provision(
          operationId,
          tenantId,
          tenantIdx,
          tenantGroup,
          params,
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
    tenant: TenantSchemaType,
    tenantGroup: TenantGroupSchemaType,
    cloudProvisionConfig: CloudProvisionGCPConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
  }> {
    switch (cloudProvisionConfig.deploymentConfigVersion) {
      case 1:
        return new TenantGCPProvisioner.provisionerVersions[1]().deprovision(
          operationId,
          tenant,
          tenantGroup,
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
    tenant: TenantSchemaType,
    tenantGroup: TenantGroupSchemaType,
    cloudProvisionConfig: CloudProvisionGCPConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
  }> {
    switch (cloudProvisionConfig.deploymentConfigVersion) {
      case 1:
        return new TenantGCPProvisioner.provisionerVersions[1]().refresh(
          operationId,
          tenant,
          tenantGroup,
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
