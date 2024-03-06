import { InvitationSchemaType } from '../../schemas/invitation';

export abstract class IInvitationsRepository {
  static repositoryName = 'InvitationsRepository';

  query(params: { email?: string; page?: number; pageSize?: number }): Promise<InvitationSchemaType[]> {
    throw new Error('Method not implemented.');
  }

  accept(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  reject(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
