import { InvitationType } from '@falkordb/schemas/src/global';
import { IInvitationsRepository } from './IInvitationsRepository';

export class InvitationsRepositoryMock implements IInvitationsRepository {
  static repositoryName = 'InvitationsRepositoryMock';

  query(params: { userId?: string; page?: number; pageSize?: number }): Promise<InvitationType[]> {
    return Promise.resolve([]);
  }

  accept(id: string): Promise<void> {
    return Promise.resolve();
  }

  reject(id: string): Promise<void> {
    return Promise.resolve();
  }
}
