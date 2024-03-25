import { SupportedCloudProviderSchemaType, SupportedRegionsSchemaType } from '@falkordb/schemas/dist/global';
import {
  TenantGroupCreateSchemaType,
  TenantGroupSchemaType,
  TenantGroupStatusSchemaType,
} from '@falkordb/schemas/dist/global/tenantGroup';

export abstract class ITenantGroupRepository {
  static repositoryName = 'TenantGroupRepository';

  abstract create(params: TenantGroupCreateSchemaType): Promise<TenantGroupSchemaType>;

  abstract delete(id: string): Promise<void>;

  abstract get(id: string): Promise<TenantGroupSchemaType>;

  abstract runTransaction<TenantGroupSchemaType>(
    id: string,
    fn: (tenantGroup: TenantGroupSchemaType) => Promise<TenantGroupSchemaType>,
  ): Promise<TenantGroupSchemaType>;

  abstract query(params: {
    status?: TenantGroupStatusSchemaType[];
    cloudProvider?: SupportedCloudProviderSchemaType;
    region?: SupportedRegionsSchemaType;
  }): Promise<TenantGroupSchemaType[]>;

  abstract addTenantTransaction(
    tenant: { id: string; name: string },
    cloudProvider: SupportedCloudProviderSchemaType,
    region: SupportedRegionsSchemaType,
  ): Promise<TenantGroupSchemaType>;

  abstract removeTenantTransaction(
    tenantId: string,
  ): Promise<TenantGroupSchemaType>;
}
