import { CreateMemberType, MemberType, UpdateMemberType } from '../../schemas/members';
import { RoleType } from '../../schemas/roles';
import { IMembersRepository } from './IMembersRepository';
import { ApiError } from '@falkordb/errors';

export class MembersRepositoryMock implements IMembersRepository {
  private _store: MemberType[] = [];

  create(params: CreateMemberType): Promise<MemberType> {
    const member: MemberType = {
      id: this._store.length.toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...params,
    };
    this._store.push(member);
    return Promise.resolve(member);
  }

  get(id: string): Promise<MemberType> {
    const member = this._store.find((o) => o.id === id);
    if (!member) {
      throw ApiError.notFound('Member not found', 'MEMBER_NOT_FOUND');
    }

    return Promise.resolve(member);
  }

  update(id: string, params: UpdateMemberType): Promise<MemberType> {
    const member = this._store.find((o) => o.id === id);
    if (!member) {
      throw ApiError.notFound('Member not found', 'MEMBER_NOT_FOUND');
    }

    member.updatedAt = new Date().toISOString();
    Object.assign(member, params);
    return Promise.resolve(member);
  }

  delete(id: string): Promise<void> {
    const index = this._store.findIndex((o) => o.id === id);
    if (index === -1) {
      throw ApiError.notFound('Member not found', 'MEMBER_NOT_FOUND');
    }

    this._store.splice(index, 1);
    return Promise.resolve();
  }

  query(params: {
    organizationId?: string;
    role?: RoleType;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: MemberType[]; count: number }> {
    const results = this._store.filter((m) => {
      if (params.organizationId && m.organizationId !== params.organizationId) {
        return false;
      }

      if (params.role && m.role !== params.role) {
        return false;
      }

      return true;
    });

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    const data = results.slice((page - 1) * pageSize, page * pageSize);

    return Promise.resolve({ data, count: results.length });
  }

  deleteQuery(params: { organizationId?: string }): Promise<void> {
    this._store = this._store.filter((m) => m.organizationId !== params.organizationId);
    return Promise.resolve();
  }
}
