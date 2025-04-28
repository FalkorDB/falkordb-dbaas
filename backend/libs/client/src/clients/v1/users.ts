import { UserSchemaType } from '@falkordb/schemas/global';
import { Client } from '../../client';
import {
  CreateUserRequestBodySchemaType,
  CreateUserRequestParamsSchemaType,
  CreateUserResponseBodySchemaType,
  DeleteUserRequestParamsSchemaType,
  GetUserInvitationsRequestParamsSchemaType,
  GetUserInvitationsRequestQuerySchemaType,
  GetUserInvitationsResponseBodySchemaType,
  GetUserMembershipsRequestParamsSchemaType,
  GetUserMembershipsRequestQuerySchemaType,
  GetUserMembershipsResponseBodySchemaType,
  GetUserRequestParamsSchemaType,
  GetUserResponseBodySchemaType,
  UpdateUserRequestBodySchemaType,
  UpdateUserRequestParamsSchemaType,
  UpdateUserResponseBodySchemaType,
} from '@falkordb/schemas/services/users/v1';

export const UsersV1 = (client: Client) => ({
  me: {
    get: (): Promise<UserSchemaType> => {
      return client.get('/me');
    },
  },

  users: {
    get: (params: GetUserRequestParamsSchemaType): Promise<GetUserResponseBodySchemaType> => {
      return client.get(`/${params.id}`);
    },

    create: (
      params: CreateUserRequestParamsSchemaType,
      body: CreateUserRequestBodySchemaType,
    ): Promise<CreateUserResponseBodySchemaType> => {
      return client.post(`/${params.id}`, body, { params });
    },

    update: (
      params: UpdateUserRequestParamsSchemaType,
      body: UpdateUserRequestBodySchemaType,
    ): Promise<UpdateUserResponseBodySchemaType> => {
      return client.put(`/${params.id}`, body);
    },

    delete: (params: DeleteUserRequestParamsSchemaType): Promise<void> => {
      return client.delete(`/${params.id}`);
    },
  },

  invitations: {
    get: (
      params: GetUserInvitationsRequestParamsSchemaType,
      query: GetUserInvitationsRequestQuerySchemaType,
    ): Promise<GetUserInvitationsResponseBodySchemaType> => {
      return client.get(`/${params.id}/invitations`, { query });
    },
  },

  memberships: {
    get: (
      params: GetUserMembershipsRequestParamsSchemaType,
      query: GetUserMembershipsRequestQuerySchemaType,
    ): Promise<GetUserMembershipsResponseBodySchemaType> => {
      return client.get(`/${params.id}/memberships`, { query });
    },
  },
});
