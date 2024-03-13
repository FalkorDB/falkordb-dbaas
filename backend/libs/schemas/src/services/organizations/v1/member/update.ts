import { type Static, Type } from '@sinclair/typebox';
import { MemberSchema } from '../../../../global/members';
import { RoleSchema } from '../../../../global/roles';

/****** Update member *******/

export const UpdateMemberRequestParamsSchema = Type.Object({
  organizationId: Type.String(),
  memberId: Type.String(),
});

export type UpdateMemberRequestParamsType = Static<typeof UpdateMemberRequestParamsSchema>;

export const UpdateMemberRequestBodySchema = Type.Object({
  role: RoleSchema,
});

export type UpdateMemberRequestBodyType = Static<typeof UpdateMemberRequestBodySchema>;

export const UpdateMemberResponseSchema = MemberSchema;

export type UpdateMemberResponseSchemaType = Static<typeof UpdateMemberResponseSchema>;
