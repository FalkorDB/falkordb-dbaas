import { type Static, Type } from '@sinclair/typebox';
import { InvitationSchema } from '../../../../../global/invitation';

/**** List invitations *****/

export const ListOrganizationInvitationsRequestParamsSchema = Type.Object({
  organizationId: Type.String(),
});

export type ListOrganizationInvitationsRequestParamsType = Static<typeof ListOrganizationInvitationsRequestParamsSchema>;

export const ListOrganizationInvitationsRequestQuerySchema = Type.Object({
  page: Type.Integer({
    minimum: 1,
    default: 1,
  }),
  pageSize: Type.Integer({
    default: 10,
  }),
});

export type ListOrganizationInvitationsRequestQueryType = Static<typeof ListOrganizationInvitationsRequestQuerySchema>;

export const ListOrganizationInvitationsResponseSchema = Type.Object({
  data: Type.Array(InvitationSchema),
  page: Type.Integer(),
  pageSize: Type.Integer(),
  total: Type.Integer(),
});

export type ListOrganizationInvitationsResponseSchemaType = Static<typeof ListOrganizationInvitationsResponseSchema>;
