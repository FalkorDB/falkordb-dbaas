import { CreateOrganizationType, OrganizationType, UpdateOrganizationType } from '../../schemas/organization';
import { IOrganizationsRepository } from './IOrganizationsRepository';
import { ApiError } from '@falkordb/errors';

export class OrganizationsRepositoryMock implements IOrganizationsRepository {
  private _store: OrganizationType[] = [];

  create(params: CreateOrganizationType): Promise<OrganizationType> {
    const organization: OrganizationType = {
      id: this._store.length.toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...params,
    };
    this._store.push(organization);
    return Promise.resolve(organization);
  }

  get(id: string): Promise<OrganizationType> {
    const organization = this._store.find((o) => o.id === id);
    if (!organization) {
      throw ApiError.notFound('Organization not found', 'ORGANIZATION_NOT_FOUND');
    }

    return Promise.resolve(organization);
  }

  update(id: string, params: UpdateOrganizationType): Promise<OrganizationType> {
    const organization = this._store.find((o) => o.id === id);
    if (!organization) {
      throw ApiError.notFound('Organization not found', 'ORGANIZATION_NOT_FOUND');
    }

    organization.updatedAt = new Date().toISOString();
    Object.assign(organization, params);
    return Promise.resolve(organization);
  }

  delete(id: string): Promise<void> {
    const index = this._store.findIndex((o) => o.id === id);
    if (index === -1) {
      throw ApiError.notFound('Organization not found', 'ORGANIZATION_NOT_FOUND');
    }

    this._store.splice(index, 1);
    return Promise.resolve();
  }
}
