import { UserMembershipItemType } from '@falkordb/schemas/src/global';

export abstract class IMembershipsRepository {
  static repositoryName = 'MembershipsRepository';

  abstract query(params: { userId?: string; page?: number; pageSize?: number }): Promise<UserMembershipItemType[]> ;

  abstract delete(userId: string, membershipId: string): Promise<void> ;
}
