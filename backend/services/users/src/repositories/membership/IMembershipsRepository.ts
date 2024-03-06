import { UserMembershipItemType } from '../../schemas/membership';

export abstract class IMembershipsRepository {
  static repositoryName = 'MembershipsRepository';

  query(params: { userId?: string; page?: number; pageSize?: number }): Promise<UserMembershipItemType[]> {
    throw new Error('Method not implemented.');
  }
}
