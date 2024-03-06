import { type Static, Type } from '@sinclair/typebox';
import { InvitationSchema } from '../../../../schemas/invitation';

/********* Get invitations *********/
export const GetInvitationsRequestParamsSchema = Type.Object({
  id: Type.String(),
});

export type GetInvitationsRequestParamsSchemaType = Static<typeof GetInvitationsRequestParamsSchema>;

export const GetInvitationsRequestQuerySchema = Type.Object({
  page: Type.Optional(Type.Number({ default: 1 })),
  pageSize: Type.Optional(Type.Number({ default: 10 })),
});

export type GetInvitationsRequestQuerySchemaType = Static<typeof GetInvitationsRequestQuerySchema>;

export const GetInvitationsResponseBodySchema = Type.Array(InvitationSchema);

export type GetInvitationsResponseBodySchemaType = Static<typeof GetInvitationsResponseBodySchema>;
