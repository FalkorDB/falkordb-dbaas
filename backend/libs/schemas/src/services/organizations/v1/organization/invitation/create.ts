import { type Static, Type } from '@sinclair/typebox';
import { RoleSchema } from '../../../../../global/roles';
import { InvitationSchema } from '../../../../../global/invitation';

/**** Create invitation *****/

export const CreateOrganizationInvitationRequestHeadersSchema = Type.Object({
  'x-falkordb-userId': Type.String(),
});

export type CreateOrganizationInvitationRequestHeadersType = Static<
  typeof CreateOrganizationInvitationRequestHeadersSchema
>;

export const CreateOrganizationInvitationRequestParamsSchema = Type.Object({
  organizationId: Type.String(),
});

export type CreateOrganizationInvitationRequestParamsType = Static<
  typeof CreateOrganizationInvitationRequestParamsSchema
>;

export const CreateOrganizationInvitationRequestBodySchema = Type.Object({
  email: Type.String(),
  role: RoleSchema,
});

export type CreateOrganizationInvitationRequestBodyType = Static<typeof CreateOrganizationInvitationRequestBodySchema>;

export const CreateOrganizationInvitationResponseSchema = InvitationSchema;

export type CreateOrganizationInvitationResponseSchemaType = Static<typeof CreateOrganizationInvitationResponseSchema>;
