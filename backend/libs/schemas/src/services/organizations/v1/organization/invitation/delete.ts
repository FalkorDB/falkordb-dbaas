import { type Static, Type } from '@sinclair/typebox';

export const DeleteOrganizationInvitationRequestParamsSchema = Type.Object({
  organizationId: Type.String(),
  invitationId: Type.String(),
});

export type DeleteOrganizationInvitationRequestParamsType = Static<typeof DeleteOrganizationInvitationRequestParamsSchema>;