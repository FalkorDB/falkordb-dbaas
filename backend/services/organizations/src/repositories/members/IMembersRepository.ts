import { CreateMemberType, MemberType, UpdateMemberType } from '../../schemas/members';
import { RoleType } from '../../schemas/roles';

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
  }): Promise<MemberType[]>;
}
