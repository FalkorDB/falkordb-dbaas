import { CreateMemberType, MemberType, UpdateMemberType, RoleType } from '@falkordb/schemas/src/global';

export abstract class IMembersRepository {
  static repositoryName = 'MembersRepository';

  abstract create(params: CreateMemberType): Promise<MemberType>;

  abstract get(id: string): Promise<MemberType>;

  abstract update(id: string, params: UpdateMemberType): Promise<MemberType>;

  abstract delete(id: string): Promise<void>;

  abstract query(params: {
    organizationId?: string;
    role?: RoleType;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: MemberType[]; count: number }>;

  abstract deleteQuery(params: { organizationId?: string }): Promise<void>;
}
