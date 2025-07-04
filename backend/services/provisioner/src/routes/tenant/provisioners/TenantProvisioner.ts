import { OperationProviderSchemaType } from '@falkordb/schemas/global';
import { TenantGroupSchemaType } from '@falkordb/schemas/global';
import { TenantGCPProvisioner } from './gcp/TenantGCPProvisioner';
import { TenantProvisionBodySchemaType } from '@falkordb/schemas/services/provisioner/v1';
import { CloudProvisionConfigSchemaType, TenantSchemaType } from '@falkordb/schemas/global';

export abstract class TenantProvisioner {
  abstract provision(
    operationId: string,
    tenantId: string,
    tenantIdx: number,
    tenantGroup: TenantGroupSchemaType,
    params: TenantProvisionBodySchemaType,
    cloudProvisionConfig: CloudProvisionConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
  }>;

  abstract deprovision(
    operationId: string,
    tenant: TenantSchemaType,
    tenantGroup: TenantGroupSchemaType,
    cloudProvisionConfig: CloudProvisionConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
  }>;

  abstract refresh(
    operationId: string,
    tenant: TenantSchemaType,
    tenantGroup: TenantGroupSchemaType,
    cloudProvisionConfig: CloudProvisionConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
  }>;
}

export class TenantProvisionerFactory {
  static get(provisioner: 'gcp'): TenantProvisioner {
    switch (provisioner) {
      case 'gcp':
        return new TenantGCPProvisioner();
      default:
        throw new Error('Unsupported provisioner');
    }
  }
}
