import { type Static, Type } from '@sinclair/typebox';
import { MemberSchema } from '../../../../../global/members';
import { RoleSchema } from '../../../../../global/roles';

/****** Update member *******/

export const UpdateOrganizationMemberRequestParamsSchema = Type.Object({
  organizationId: Type.String(),
  memberId: Type.String(),
});

export type UpdateOrganizationMemberRequestParamsType = Static<typeof UpdateOrganizationMemberRequestParamsSchema>;

export const UpdateOrganizationMemberRequestBodySchema = Type.Object({
  role: RoleSchema,
});

export type UpdateOrganizationMemberRequestBodyType = Static<typeof UpdateOrganizationMemberRequestBodySchema>;

export const UpdateOrganizationMemberResponseSchema = MemberSchema;

export type UpdateOrganizationMemberResponseSchemaType = Static<typeof UpdateOrganizationMemberResponseSchema>;
