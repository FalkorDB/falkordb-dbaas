import { CreateTenantSchemaType, TenantSchemaType, TenantStatusSchemaType } from '../../schemas/tenant';

export abstract class ITenantsRepository {
  static repositoryName = 'TenantsRepository';

  create(id: string, params: CreateTenantSchemaType): Promise<TenantSchemaType> {
    throw new Error('Not implemented');
  }

  delete(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  get(id: string): Promise<TenantSchemaType> {
    throw new Error('Not implemented');
  }

  runTransaction<TenantSchemaType>(
    id: string,
    fn: (tenant: TenantSchemaType) => Promise<TenantSchemaType>,
  ): Promise<TenantSchemaType> {
    throw new Error('Not implemented');
  }

  query(params: { status?: TenantStatusSchemaType }): Promise<TenantSchemaType[]> {
    throw new Error('Not implemented');
  }
}
