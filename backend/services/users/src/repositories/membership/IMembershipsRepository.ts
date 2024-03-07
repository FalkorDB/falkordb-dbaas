import { UserMembershipItemType } from '../../schemas/membership';

export abstract class IMembershipsRepository {
  static repositoryName = 'MembershipsRepository';

  abstract query(params: { userId?: string; page?: number; pageSize?: number }): Promise<UserMembershipItemType[]> ;

  abstract delete(userId: string, membershipId: string): Promise<void> ;
}
