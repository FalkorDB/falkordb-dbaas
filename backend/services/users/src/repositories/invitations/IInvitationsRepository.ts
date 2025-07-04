import { InvitationType } from '@falkordb/schemas/global';

export abstract class IInvitationsRepository {
  static repositoryName = 'InvitationsRepository';

  abstract query(params: { email?: string; page?: number; pageSize?: number }): Promise<{
    data: InvitationType[];
    total: number;
  }>;
  
}
