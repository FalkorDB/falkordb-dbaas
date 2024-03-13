import { type Static, Type } from '@sinclair/typebox';

/********* Reject membership *********/

export const RejectInvitationRequestHeadersSchemaType = Type.Object({
  'x-falkordb-userId': Type.String(),
});

export type RejectInvitationRequestHeadersSchemaType = Static<typeof RejectInvitationRequestHeadersSchemaType>;

export const RejectInvitationRequestParamsSchema = Type.Object({
  id: Type.String(),
  invitationId: Type.String(),
});

export type RejectInvitationRequestParamsSchemaType = Static<typeof RejectInvitationRequestParamsSchema>;
