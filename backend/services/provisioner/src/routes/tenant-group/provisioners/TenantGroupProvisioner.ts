
import { OperationProviderSchemaType } from '@falkordb/schemas/global';
import { TenantGroupSchemaType } from '@falkordb/schemas/global';
import { TenantGroupGCPProvisioner } from './gcp/TenantGroupGCPProvisioner';
import { CloudProvisionConfigSchemaType, SupportedRegionsSchemaType } from '@falkordb/schemas/global';

export abstract class TenantGroupProvisioner {
  abstract provision(
    operationId: string,
    tenantGroupId: string,
    region: SupportedRegionsSchemaType,
    cloudProvisionConfig: CloudProvisionConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
  }>;

  abstract deprovision(
    operationId: string,
    tenantGroup: TenantGroupSchemaType,
    region: SupportedRegionsSchemaType,
    cloudProvisionConfig: CloudProvisionConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
  }>;

  abstract refresh(
    operationId: string,
    tenantGroupId: string,
    region: SupportedRegionsSchemaType,
    cloudProvisionConfig: CloudProvisionConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
  }>;
}

export class TenantGroupProvisionerFactory {
  static get(provisioner: 'gcp'): TenantGroupProvisioner {
    switch (provisioner) {
      case 'gcp':
        return new TenantGroupGCPProvisioner();
      default:
        throw new Error('Unsupported provisioner');
    }
  }
}
