import { CreateTenantSchemaType, TenantSchemaType, TenantStatusSchemaType } from "@falkordb/schemas/global";

export abstract class ITenantsRepository {
  static repositoryName = 'TenantsRepository';

  abstract create(id: string, params: CreateTenantSchemaType): Promise<TenantSchemaType>;

  abstract delete(id: string): Promise<void>;

  abstract get(id: string): Promise<TenantSchemaType>;

  abstract runTransaction<TenantSchemaType>(
    id: string,
    fn: (tenant: TenantSchemaType) => Promise<TenantSchemaType>,
  ): Promise<TenantSchemaType>;

  abstract query(params: { status?: TenantStatusSchemaType }): Promise<TenantSchemaType[]>;
}
