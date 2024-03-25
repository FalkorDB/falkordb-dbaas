import { type Static, Type } from '@sinclair/typebox';
import { InvitationSchema } from '../../../../global/invitation';

/**** List invitations *****/

export const ListInvitationsRequestQuerySchema = Type.Object({
  organizationId: Type.Optional(Type.String()),
  email: Type.Optional(Type.String()),
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
