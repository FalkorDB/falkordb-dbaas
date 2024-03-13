import { type Static, Type } from '@sinclair/typebox';
import { RoleSchema } from '../../../../global/roles';
import { InvitationSchema } from '../../../../global/invitation';

/**** Create invitation *****/

export const CreateInvitationRequestHeadersSchema = Type.Object({
  'x-falkordb-userId': Type.String(),
});

export type CreateInvitationRequestHeadersType = Static<typeof CreateInvitationRequestHeadersSchema>;

export const CreateInvitationRequestParamsSchema = Type.Object({
  organizationId: Type.String(),
});

export type CreateInvitationRequestParamsType = Static<typeof CreateInvitationRequestParamsSchema>;

export const CreateInvitationRequestBodySchema = Type.Object({
  email: Type.String(),
  role: RoleSchema,
});

export type CreateInvitationRequestBodyType = Static<typeof CreateInvitationRequestBodySchema>;

export const CreateInvitationResponseSchema = InvitationSchema;

export type CreateInvitationResponseSchemaType = Static<typeof CreateInvitationResponseSchema>;
