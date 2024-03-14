import { FalkorDBClient } from '@falkordb/rest-client';
import { ListInvitationsResponseSchemaType } from '@falkordb/schemas/src/services/organizations/v1';
import { IInvitationsRepository } from './IInvitationsRepository';

export class InvitationsRepositoryFalkorDBClient implements IInvitationsRepository {
  constructor(private _client: FalkorDBClient) {}

  query(params: { email?: string; page?: number; pageSize?: number }): Promise<ListInvitationsResponseSchemaType> {
    return this._client.services.v1.organizations().invitations.list({
      email: params.email,
      page: params.page,
      pageSize: params.pageSize,
    });
  }

}
