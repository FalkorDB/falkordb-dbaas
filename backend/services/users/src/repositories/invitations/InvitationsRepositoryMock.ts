import { InvitationSchemaType } from '../../schemas/invitation';
import { IInvitationsRepository } from './IInvitationsRepository';

export class InvitationsRepositoryMock implements IInvitationsRepository {
  static repositoryName = 'InvitationsRepositoryMock';

  query(params: { userId?: string; page?: number; pageSize?: number }): Promise<InvitationSchemaType[]> {
    return Promise.resolve([]);
  }
}
