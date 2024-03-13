import { InvitationType } from '@falkordb/schemas/src/global';

export abstract class IInvitationsRepository {
  static repositoryName = 'InvitationsRepository';

  abstract query(params: { email?: string; page?: number; pageSize?: number }): Promise<InvitationType[]>;

  abstract accept(id: string): Promise<void>;

  abstract reject(id: string): Promise<void>;
}
