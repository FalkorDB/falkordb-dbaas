import { InvitationType } from '@falkordb/schemas/global';
import { IInvitationsRepository } from './IInvitationsRepository';

export class InvitationsRepositoryMock implements IInvitationsRepository {
  static repositoryName = 'InvitationsRepositoryMock';

  query(params: { userId?: string; page?: number; pageSize?: number }): Promise<{
    data: InvitationType[];
    total: number;
  }> {
    return Promise.resolve({ total: 0, data: [] });
  }

}
