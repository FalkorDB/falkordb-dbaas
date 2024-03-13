import { type Static, Type } from '@sinclair/typebox';

/********* Reject membership *********/

export const RejectInvitationRequestParamsSchema = Type.Object({
  id: Type.String(),
  invitationId: Type.String(),
});

export type RejectInvitationRequestParamsSchemaType = Static<typeof RejectInvitationRequestParamsSchema>;
