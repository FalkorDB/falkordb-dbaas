import { UserMembershipItemType } from '../../schemas/membership';
import { IMembershipsRepository } from './IMembershipsRepository';

export class MembershipsRepositoryMock implements IMembershipsRepository {
  static repositoryName = 'MembershipsRepositoryMock';

  query(params: { userId?: string; page?: number; pageSize?: number }): Promise<UserMembershipItemType[]> {
    return Promise.resolve([]);
  }

  delete(userId: string, membershipId: string): Promise<void> {
    return Promise.resolve();
  }
}
