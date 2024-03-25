import { CreateInvitationType, InvitationType, UpdateInvitationType } from '@falkordb/schemas/dist/global';

export abstract class IInvitationsRepository {
  static repositoryName = 'InvitationsRepository';

  abstract create(params: CreateInvitationType): Promise<InvitationType>;

  abstract get(id: string): Promise<InvitationType>;

  abstract update(id: string, params: UpdateInvitationType): Promise<InvitationType>;

  abstract delete(id: string): Promise<void>;

  abstract query(params: {
    email?: string;
    organizationId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: InvitationType[]; count: number }>;
}
