import { type Static, Type } from '@sinclair/typebox';

/********* Accept membership *********/

export const AcceptOrganizationInvitationRequestHeadersSchemaType = Type.Object({
  'x-falkordb-userId': Type.String(),
});

export type AcceptOrganizationInvitationRequestHeadersSchemaType = Static<typeof AcceptOrganizationInvitationRequestHeadersSchemaType>;

export const AcceptOrganizationInvitationRequestParamsSchema = Type.Object({
  id: Type.String(),
  invitationId: Type.String(),
});

export type AcceptOrganizationInvitationRequestParamsSchemaType = Static<typeof AcceptOrganizationInvitationRequestParamsSchema>;
