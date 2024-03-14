import { type Static, Type } from '@sinclair/typebox';

/********* Reject membership *********/

export const RejectOrganizationInvitationRequestHeadersSchemaType = Type.Object({
  'x-falkordb-userId': Type.String(),
});

export type RejectOrganizationInvitationRequestHeadersSchemaType = Static<typeof RejectOrganizationInvitationRequestHeadersSchemaType>;

export const RejectOrganizationInvitationRequestParamsSchema = Type.Object({
  id: Type.String(),
  invitationId: Type.String(),
});

export type RejectOrganizationInvitationRequestParamsSchemaType = Static<typeof RejectOrganizationInvitationRequestParamsSchema>;
