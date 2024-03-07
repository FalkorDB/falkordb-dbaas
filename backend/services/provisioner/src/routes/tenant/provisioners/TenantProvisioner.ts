import { CloudProvisionConfigSchemaType } from '../../../schemas/cloudProvision';
import { OperationProviderSchemaType } from '../../../schemas/operation';
import { TenantSchemaType } from '../../../schemas/tenant';
import { TenantGroupSchemaType } from '../../../schemas/tenantGroup';
import { TenantProvisionBodySchemaType } from '../schemas/provision';
import { TenantGCPProvisioner } from './gcp/TenantGCPProvisioner';

export abstract class TenantProvisioner {
  provision(
    operationId: string,
    tenantId: string,
    tenantIdx: number,
    tenantGroup: TenantGroupSchemaType,
    params: TenantProvisionBodySchemaType,
    cloudProvisionConfig: CloudProvisionConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
  }> {
    throw new Error('Method not implemented.');
  }

  deprovision(
    operationId: string,
    tenant: TenantSchemaType,
    tenantGroup: TenantGroupSchemaType,
    cloudProvisionConfig: CloudProvisionConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
  }> {
    throw new Error('Method not implemented.');
  }

  refresh(
    operationId: string,
    tenant: TenantSchemaType,
    tenantGroup: TenantGroupSchemaType,
    cloudProvisionConfig: CloudProvisionConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
  }> {
    throw new Error('Method not implemented.');
  }
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
