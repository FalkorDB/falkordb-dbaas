import { UserMembershipItemType } from '@falkordb/schemas/dist/global';
import { IMembershipsRepository } from './IMembershipsRepository';

export class MembershipsRepositoryMock implements IMembershipsRepository {
  static repositoryName = 'MembershipsRepositoryMock';

  query(params: {
    userId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ total: number; data: UserMembershipItemType[] }> {
    return Promise.resolve({
      total: 0,
      data: [],
    });
  }

  delete(membershipId: string): Promise<void> {
    return Promise.resolve();
  }
}
