import { type Static, Type } from '@sinclair/typebox';
import { InvitationSchema } from '../../../../../../schemas/invitation';

export const DeleteInvitationRequestParamsSchema = Type.Object({
  organizationId: Type.String(),
  invitationId: Type.String(),
});

export type DeleteInvitationRequestParamsType = Static<typeof DeleteInvitationRequestParamsSchema>;

export const ResendInvitationRequestParamsSchema = Type.Object({
  organizationId: Type.String(),
  invitationId: Type.String(),
});

export type ResendInvitationRequestParamsType = Static<typeof ResendInvitationRequestParamsSchema>;

export const ResendInvitationResponseSchema = InvitationSchema;

export type ResendInvitationResponseSchemaType = Static<typeof ResendInvitationResponseSchema>;
