import { type Static, Type } from '@sinclair/typebox';

/********* Accept membership *********/

export const AcceptInvitationRequestHeadersSchemaType = Type.Object({
  'x-falkordb-userId': Type.String(),
});

export type AcceptInvitationRequestHeadersSchemaType = Static<typeof AcceptInvitationRequestHeadersSchemaType>;

export const AcceptInvitationRequestParamsSchema = Type.Object({
  id: Type.String(),
  invitationId: Type.String(),
});

export type AcceptInvitationRequestParamsSchemaType = Static<typeof AcceptInvitationRequestParamsSchema>;
