import { TenantGroupCreateSchemaType, TenantGroupSchemaType } from '../../schemas/tenantGroup';

export abstract class ITenantGroupRepository {
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

  query(params: { id?: string }): Promise<TenantGroupSchemaType[]> {
    throw new Error('Not implemented');
  }
}
