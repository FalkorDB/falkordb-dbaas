import { UserMembershipItemType } from '@falkordb/schemas/global';

export abstract class IMembershipsRepository {
  static repositoryName = 'MembershipsRepository';

  abstract query(params: {
    userId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: UserMembershipItemType[]; total: number }>;

  abstract delete(memberId: string): Promise<void>;
}
