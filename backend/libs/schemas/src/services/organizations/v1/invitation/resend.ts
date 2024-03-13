import { type Static, Type } from '@sinclair/typebox';
import { InvitationSchema } from '../../../../global/invitation';

export const ResendInvitationRequestParamsSchema = Type.Object({
  organizationId: Type.String(),
  invitationId: Type.String(),
});

export type ResendInvitationRequestParamsType = Static<typeof ResendInvitationRequestParamsSchema>;

export const ResendInvitationResponseSchema = InvitationSchema;

export type ResendInvitationResponseSchemaType = Static<typeof ResendInvitationResponseSchema>;
