import { UserSchemaType } from '@falkordb/schemas/src/global';
import { Client } from '../../client';
import {
  CreateUserRequestBodySchemaType,
  CreateUserRequestParamsSchemaType,
  CreateUserResponseBodySchemaType,
  DeleteUserRequestParamsSchemaType,
  GetInvitationsRequestParamsSchemaType,
  GetInvitationsRequestQuerySchemaType,
  GetInvitationsResponseBodySchemaType,
  GetMembershipsRequestParamsSchemaType,
  GetMembershipsRequestQuerySchemaType,
  GetMembershipsResponseBodySchemaType,
  GetUserRequestParamsSchemaType,
  GetUserResponseBodySchemaType,
  UpdateUserRequestBodySchemaType,
  UpdateUserRequestParamsSchemaType,
  UpdateUserResponseBodySchemaType,
} from '@falkordb/schemas/src/services/users/v1';

export const UsersV1 = (client: Client) => ({
  me: {
    get: (): Promise<UserSchemaType> => {
      return client.get('/users/me');
    },
  },

  users: {
    get: (params: GetUserRequestParamsSchemaType): Promise<GetUserResponseBodySchemaType> => {
      return client.get(`/users/${params.id}`);
    },

    create: (
      params: CreateUserRequestParamsSchemaType,
      body: CreateUserRequestBodySchemaType,
    ): Promise<CreateUserResponseBodySchemaType> => {
      return client.post('/users', body, { params });
    },

    update: (
      params: UpdateUserRequestParamsSchemaType,
      body: UpdateUserRequestBodySchemaType,
    ): Promise<UpdateUserResponseBodySchemaType> => {
      return client.put(`/users/${params.id}`, body);
    },

    delete: (params: DeleteUserRequestParamsSchemaType): Promise<void> => {
      return client.delete(`/users/${params.id}`);
    },
  },

  invitations: {
    get: (
      params: GetInvitationsRequestParamsSchemaType,
      query: GetInvitationsRequestQuerySchemaType,
    ): Promise<GetInvitationsResponseBodySchemaType> => {
      return client.get(`/users/${params.id}/invitations`, { query });
    },
  },

  memberships: {
    get: (
      params: GetMembershipsRequestParamsSchemaType,
      query: GetMembershipsRequestQuerySchemaType,
    ): Promise<GetMembershipsResponseBodySchemaType> => {
      return client.get(`/users/${params.id}/memberships`, { query });
    },
  },
});
