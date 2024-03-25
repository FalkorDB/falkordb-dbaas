import { FalkorDBClient } from '@falkordb/rest-client';
import { ListMembersResponseSchemaType } from '@falkordb/schemas/dist/services/organizations/v1';
import { IMembershipsRepository } from './IMembershipsRepository';

export class MembershipsRepositoryFalkorDBClient implements IMembershipsRepository {
  constructor(private _client: FalkorDBClient) {}

  query(params: { userId?: string; page?: number; pageSize?: number }): Promise<ListMembersResponseSchemaType> {
    return this._client.services.v1.organizations().members.list({
      userId: params.userId,
      page: params.page,
      pageSize: params.pageSize,
    });
  }

  delete(memberId: string): Promise<void> {
    return this._client.services.v1.organizations().members.delete({
      memberId,
    });
  }
}
