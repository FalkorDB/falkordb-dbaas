import { CreateInvitationType, InvitationType, UpdateInvitationType } from '@falkordb/schemas/dist/global';
import { IInvitationsRepository } from './IInvitationsRepository';
import { ApiError } from '@falkordb/errors';

export class InvitationsRepositoryMock implements IInvitationsRepository {
  private _store: InvitationType[] = [];

  create(params: CreateInvitationType): Promise<InvitationType> {
    const invitation: InvitationType = {
      id: this._store.length.toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...params,
    };
    this._store.push(invitation);
    return Promise.resolve(invitation);
  }

  get(id: string): Promise<InvitationType> {
    const invitation = this._store.find((o) => o.id === id);
    if (!invitation) {
      throw ApiError.notFound('Invitation not found', 'INVITATION_NOT_FOUND');
    }

    return Promise.resolve(invitation);
  }

  update(id: string, params: UpdateInvitationType): Promise<InvitationType> {
    const invitation = this._store.find((o) => o.id === id);
    if (!invitation) {
      throw ApiError.notFound('Invitation not found', 'INVITATION_NOT_FOUND');
    }

    invitation.updatedAt = new Date().toISOString();
    Object.assign(invitation, params);
    return Promise.resolve(invitation);
  }

  delete(id: string): Promise<void> {
    const index = this._store.findIndex((o) => o.id === id);
    if (index === -1) {
      throw ApiError.notFound('Invitation not found', 'INVITATION_NOT_FOUND');
    }

    this._store.splice(index, 1);
    return Promise.resolve();
  }

  query(params: {
    email?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: InvitationType[]; count: number }> {
    const results = this._store.filter((m) => {
      if (params.email && m.email !== params.email) {
        return false;
      }

      return true;
    });

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    const data = results.slice((page - 1) * pageSize, page * pageSize);
    return Promise.resolve({ data, count: results.length });
  }
}
