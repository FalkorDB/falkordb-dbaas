import { type Static, Type } from '@sinclair/typebox';
import { InvitationSchema } from '../../../../../schemas/invitation';
import { RoleSchema } from '../../../../../schemas/roles';

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

/**** Create invitation *****/

export const CreateInvitationRequestHeadersSchema = Type.Object({
  'x-falkordb-userId': Type.String(),
});

export type CreateInvitationRequestHeadersType = Static<typeof CreateInvitationRequestHeadersSchema>;

export const CreateInvitationRequestParamsSchema = Type.Object({
  organizationId: Type.String(),
});

export type CreateInvitationRequestParamsType = Static<typeof CreateInvitationRequestParamsSchema>;

export const CreateInvitationRequestBodySchema = Type.Object({
  email: Type.String(),
  role: RoleSchema,
});

export type CreateInvitationRequestBodyType = Static<typeof CreateInvitationRequestBodySchema>;

export const CreateInvitationResponseSchema = InvitationSchema;

export type CreateInvitationResponseSchemaType = Static<typeof CreateInvitationResponseSchema>;
