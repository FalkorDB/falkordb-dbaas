import { InvitationSchemaType } from '../../schemas/invitation';

export abstract class IInvitationsRepository {
  static repositoryName = 'InvitationsRepository';

  abstract query(params: { email?: string; page?: number; pageSize?: number }): Promise<InvitationSchemaType[]> ;

  abstract accept(id: string): Promise<void> ;

  abstract reject(id: string): Promise<void> ;
}
