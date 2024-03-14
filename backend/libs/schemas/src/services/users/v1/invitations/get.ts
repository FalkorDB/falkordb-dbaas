import { type Static, Type } from '@sinclair/typebox';
import { InvitationSchema } from '../../../../global';

/********* Get invitations *********/
export const GetUserInvitationsRequestParamsSchema = Type.Object({
  id: Type.String(),
});

export type GetUserInvitationsRequestParamsSchemaType = Static<typeof GetUserInvitationsRequestParamsSchema>;

export const GetUserInvitationsRequestQuerySchema = Type.Object({
  page: Type.Optional(Type.Number({ default: 1 })),
  pageSize: Type.Optional(Type.Number({ default: 10 })),
});

export type GetUserInvitationsRequestQuerySchemaType = Static<typeof GetUserInvitationsRequestQuerySchema>;

export const GetUserInvitationsResponseBodySchema = Type.Object({
  data: Type.Array(InvitationSchema),
  page: Type.Number(),
  pageSize: Type.Number(),
  total: Type.Number(),
});

export type GetUserInvitationsResponseBodySchemaType = Static<typeof GetUserInvitationsResponseBodySchema>;
