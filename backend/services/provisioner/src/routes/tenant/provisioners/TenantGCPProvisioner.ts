import { ApiError } from '../../../errors/ApiError';
import { CloudProvisionGCPConfigSchemaType } from '../../../schemas/cloudProvision';
import { SupportedRegionsSchemaType } from '../../../schemas/global';
import { OperationProviderSchemaType } from '../../../schemas/operation';
import { TenantGroupSchemaType } from '../../../schemas/tenantGroup';
import { TenantProvisionBodySchemaType } from '../schemas/provision';
import { TenantGCPProvisionerV1 } from './TenantGCPProvisionerV1';

export class TenantGCPProvisioner {
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

  // deprovision(
  //   operationId: string,
  //   tenantGroupId: string,
  //   region: SupportedRegionsSchemaType,
  //   cloudProvisionConfig: CloudProvisionGCPConfigSchemaType,
  // ): Promise<{
  //   operationProvider: OperationProviderSchemaType;
  // }> {
  //   switch (cloudProvisionConfig.deploymentConfigVersion) {
  //     case 1:
  //       return new TenantGCPProvisioner.provisionerVersions[1]().deprovision(
  //         operationId,
  //         tenantGroupId,
  //         region,
  //         cloudProvisionConfig,
  //       );
  //     default:
  //       throw ApiError.unprocessableEntity(
  //         'Unsupported deploymentConfigVersion',
  //         'UNSUPPORTED_DEPLOYMENT_CONFIG_VERSION',
  //       );
  //   }
  // }

  // refresh(
  //   operationId: string,
  //   tenantGroupId: string,
  //   region: SupportedRegionsSchemaType,
  //   cloudProvisionConfig: CloudProvisionGCPConfigSchemaType,
  // ): Promise<{
  //   operationProvider: OperationProviderSchemaType;
  // }> {
  //   switch (cloudProvisionConfig.deploymentConfigVersion) {
  //     case 1:
  //       return new TenantGCPProvisioner.provisionerVersions[1]().refresh(
  //         operationId,
  //         tenantGroupId,
  //         region,
  //         cloudProvisionConfig,
  //       );
  //     default:
  //       throw ApiError.unprocessableEntity(
  //         'Unsupported deploymentConfigVersion',
  //         'UNSUPPORTED_DEPLOYMENT_CONFIG_VERSION',
  //       );
  //   }
  // }
}
