import { type Static, Type } from '@sinclair/typebox';

/********* Accept membership *********/

export const AcceptInvitationRequestParamsSchema = Type.Object({
  id: Type.String(),
  invitationId: Type.String(),
});

export type AcceptInvitationRequestParamsSchemaType = Static<typeof AcceptInvitationRequestParamsSchema>;
