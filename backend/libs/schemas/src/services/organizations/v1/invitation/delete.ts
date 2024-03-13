import { type Static, Type } from '@sinclair/typebox';

export const DeleteInvitationRequestParamsSchema = Type.Object({
  organizationId: Type.String(),
  invitationId: Type.String(),
});

export type DeleteInvitationRequestParamsType = Static<typeof DeleteInvitationRequestParamsSchema>;