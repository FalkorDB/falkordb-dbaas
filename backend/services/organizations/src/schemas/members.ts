import { type Static, Type } from '@sinclair/typebox';
import { RoleSchema } from './roles';

export const MemberSchema = Type.Object({
  id: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),

  userId: Type.String(),
  organizationId: Type.String(),
  role: RoleSchema,
});

export type MemberType = Static<typeof MemberSchema>;

export const CreateMemberSchema = Type.Object({
  userId: Type.String(),
  organizationId: Type.String(),
  role: RoleSchema,
});

export type CreateMemberType = Static<typeof CreateMemberSchema>;

export const UpdateMemberSchema = Type.Object({
  role: RoleSchema,
});

export type UpdateMemberType = Static<typeof UpdateMemberSchema>;