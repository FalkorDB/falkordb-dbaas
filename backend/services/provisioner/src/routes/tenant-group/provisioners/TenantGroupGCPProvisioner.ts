import { ApiError } from '../../../errors/ApiError';
import { CloudProvisionGCPConfigSchemaType } from '../../../schemas/cloudProvision';
import { SupportedRegionsSchemaType } from '../../../schemas/global';
import { OperationProviderSchemaType } from '../../../schemas/operation';
import { CloudBuildClient } from '@google-cloud/cloudbuild';
import { TenantGroupGCPProvisionerV1 } from './TenantGroupGCPProvisionerV1';

export class TenantGroupGCPProvisioner {
  static provisionerVersions = {
    1: TenantGroupGCPProvisionerV1,
  };

  provision(
    tenantGroupId: string,
    region: SupportedRegionsSchemaType,
    cloudProvisionConfig: CloudProvisionGCPConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
    operationProviderId: string;
  }> {
    switch (cloudProvisionConfig.deploymentConfigVersion) {
      case 1:
        return new TenantGroupGCPProvisioner.provisionerVersions[1]().provision(
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
    tenantGroupId: string,
    region: SupportedRegionsSchemaType,
    cloudProvisionConfig: CloudProvisionGCPConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
    operationProviderId: string;
  }> {
    switch (cloudProvisionConfig.deploymentConfigVersion) {
      case 1:
        return new TenantGroupGCPProvisioner.provisionerVersions[1]().deprovision(
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
