import { type Static, Type } from '@sinclair/typebox';
import { InvitationSchema } from '../../../../../global/invitation';

export const ResendOrganizationInvitationRequestParamsSchema = Type.Object({
  organizationId: Type.String(),
  invitationId: Type.String(),
});

export type ResendOrganizationInvitationRequestParamsType = Static<typeof ResendOrganizationInvitationRequestParamsSchema>;

export const ResendOrganizationInvitationResponseSchema = InvitationSchema;

export type ResendOrganizationInvitationResponseSchemaType = Static<typeof ResendOrganizationInvitationResponseSchema>;
