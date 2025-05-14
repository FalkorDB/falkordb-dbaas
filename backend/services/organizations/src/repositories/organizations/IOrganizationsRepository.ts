import { CreateOrganizationType, OrganizationType, UpdateOrganizationType } from '@falkordb/schemas/global';

export abstract class IOrganizationsRepository {
  static repositoryName = 'OrganizationsRepository';

  abstract create(params: CreateOrganizationType): Promise<OrganizationType>;

  abstract get(id: string): Promise<OrganizationType>;

  abstract update(id: string, params: UpdateOrganizationType): Promise<OrganizationType>;

  abstract delete(id: string): Promise<void>;

  abstract list(params: { page: number; pageSize: number }): Promise<{ count: number; data: OrganizationType[] }>;
}
