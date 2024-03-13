import { type Static, Type } from '@sinclair/typebox';
import { InvitationSchema } from '../../../../global/invitation';

/**** List invitations *****/

export const ListInvitationsRequestParamsSchema = Type.Object({
  organizationId: Type.String(),
});

export type ListInvitationsRequestParamsType = Static<typeof ListInvitationsRequestParamsSchema>;

export const ListInvitationsRequestQuerySchema = Type.Object({
  data: Type.Array(InvitationSchema),
  page: Type.Integer({
    minimum: 1,
    default: 1,
  }),
  pageSize: Type.Integer({
    default: 10,
  }),
});

export type ListInvitationsRequestQueryType = Static<typeof ListInvitationsRequestQuerySchema>;

export const ListInvitationsResponseSchema = Type.Object({
  data: Type.Array(InvitationSchema),
  page: Type.Integer(),
  pageSize: Type.Integer(),
  total: Type.Integer(),
});

export type ListInvitationsResponseSchemaType = Static<typeof ListInvitationsResponseSchema>;
