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

  runTransaction<T>(
    id: string,
    fn: (tenantGroup: TenantGroupSchemaType, commit: (tenantGroup: TenantGroupSchemaType) => void) => Promise<T>,
  ): Promise<T> {
    throw new Error('Not implemented');
  }

  query(params: { id?: string }): Promise<TenantGroupSchemaType[]> {
    throw new Error('Not implemented');
  }
}
