import {
  TenantGroupCreateSchemaType,
  TenantGroupSchemaType,
  TenantGroupStatusSchemaType,
} from '../../schemas/tenantGroup';

export abstract class ITenantGroupRepository {
  static repositoryName = 'TenantGroupRepository';

  create(params: TenantGroupCreateSchemaType): Promise<TenantGroupSchemaType> {
    throw new Error('Not implemented');
  }

  delete(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  get(id: string): Promise<TenantGroupSchemaType> {
    throw new Error('Not implemented');
  }

  runTransaction<TenantGroupSchemaType>(
    id: string,
    fn: (tenantGroup: TenantGroupSchemaType) => Promise<TenantGroupSchemaType>,
  ): Promise<TenantGroupSchemaType> {
    throw new Error('Not implemented');
  }

  query(params: { status?: TenantGroupStatusSchemaType }): Promise<TenantGroupSchemaType[]> {
    throw new Error('Not implemented');
  }
}
