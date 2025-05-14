import {
  AcceptOrganizationInvitationRequestParamsSchemaType,
  CreateOrganizationInvitationRequestBodyType,
  CreateOrganizationInvitationRequestParamsType,
  CreateOrganizationInvitationResponseSchemaType,
  CreateOrganizationRequestBodyType,
  CreateOrganizationResponseType,
  DeleteMemberRequestParamsType,
  DeleteOrganizationInvitationRequestParamsType,
  DeleteOrganizationMemberRequestParamsType,
  DeleteOrganizationRequestParamsType,
  GetOrganizationRequestParamsType,
  GetOrganizationResponseSchemaType,
  ListInvitationsRequestQueryType,
  ListInvitationsResponseSchemaType,
  ListMembersRequestQueryType,
  ListMembersResponseSchemaType,
  ListOrganizationInvitationsRequestParamsType,
  ListOrganizationInvitationsRequestQueryType,
  ListOrganizationInvitationsResponseSchemaType,
  ListOrganizationMembersRequestParamsType,
  ListOrganizationMembersRequestQueryType,
  ListOrganizationMembersResponseSchemaType,
  ListOrganizationsRequestQueryType,
  ListOrganizationsResponseType,
  RejectOrganizationInvitationRequestParamsSchemaType,
  ResendOrganizationInvitationRequestParamsType,
  ResendOrganizationInvitationResponseSchemaType,
  UpdateOrganizationMemberRequestBodyType,
  UpdateOrganizationMemberRequestParamsType,
  UpdateOrganizationMemberResponseSchemaType,
  UpdateOrganizationRequestParamsType,
  UpdateOrganizationResponseSchemaType,
} from '@falkordb/schemas/services/organizations/v1';
import { Client } from '../../client';

export const OrganizationsV1 = (client: Client) => ({
  organizations: {
    list: (query: ListOrganizationsRequestQueryType): Promise<ListOrganizationsResponseType> => {
      return client.get('/', { query });
    },

    create: (body: CreateOrganizationRequestBodyType): Promise<CreateOrganizationResponseType> => {
      return client.post('/', body);
    },
  },

  organization: {
    get: (params: GetOrganizationRequestParamsType): Promise<GetOrganizationResponseSchemaType> => {
      return client.get(`/${params.organizationId}`);
    },

    update: (
      params: UpdateOrganizationRequestParamsType,
      body: CreateOrganizationRequestBodyType,
    ): Promise<UpdateOrganizationResponseSchemaType> => {
      return client.put(`/${params.organizationId}`, body);
    },

    delete: (params: DeleteOrganizationRequestParamsType): Promise<void> => {
      return client.delete(`/${params.organizationId}`);
    },
  },

  organizationMembers: {
    list: (
      params: ListOrganizationMembersRequestParamsType,
      query: ListOrganizationMembersRequestQueryType,
    ): Promise<ListOrganizationMembersResponseSchemaType> => {
      return client.get(`/${params.organizationId}/members`, { query });
    },

    update: (
      params: UpdateOrganizationMemberRequestParamsType,
      body: UpdateOrganizationMemberRequestBodyType,
    ): Promise<UpdateOrganizationMemberResponseSchemaType> => {
      return client.put(`/${params.organizationId}/members/${params.memberId}`, body);
    },

    delete: (params: DeleteOrganizationMemberRequestParamsType): Promise<void> => {
      return client.delete(`/${params.organizationId}/members/${params.memberId}`);
    },
  },

  organizationInvitations: {
    list: (
      params: ListOrganizationInvitationsRequestParamsType,
      query: ListOrganizationInvitationsRequestQueryType,
    ): Promise<ListOrganizationInvitationsResponseSchemaType> => {
      return client.get(`/${params.organizationId}/invitations`, { query });
    },

    create: (
      params: CreateOrganizationInvitationRequestParamsType,
      body: CreateOrganizationInvitationRequestBodyType,
    ): Promise<CreateOrganizationInvitationResponseSchemaType> => {
      return client.put(`/${params.organizationId}/invitations`, body);
    },

    delete: (params: DeleteOrganizationInvitationRequestParamsType): Promise<void> => {
      return client.delete(`/${params.organizationId}/invitations/${params.invitationId}`);
    },

    resend: (
      params: ResendOrganizationInvitationRequestParamsType,
    ): Promise<ResendOrganizationInvitationResponseSchemaType> => {
      return client.post(`/${params.organizationId}/invitations/${params.invitationId}/resend`, {});
    },

    accept: (params: AcceptOrganizationInvitationRequestParamsSchemaType): Promise<void> => {
      return client.post(`/${params.organizationId}/invitations/${params.invitationId}/accept`, {});
    },

    reject: (params: RejectOrganizationInvitationRequestParamsSchemaType): Promise<void> => {
      return client.post(`/${params.organizationId}/invitations/${params.invitationId}/reject`, {});
    },
  },

  invitations: {
    list: (query: ListInvitationsRequestQueryType): Promise<ListInvitationsResponseSchemaType> => {
      return client.get(`/invitations`, { query });
    },
  },

  members: {
    list: (query: ListMembersRequestQueryType): Promise<ListMembersResponseSchemaType> => {
      return client.get(`/members`, { query });
    },

    delete: (params: DeleteMemberRequestParamsType): Promise<void> => {
      return client.delete(`/members/${params.memberId}`);
    },
  },
});
