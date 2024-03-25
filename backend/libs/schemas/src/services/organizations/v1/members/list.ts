import { type Static, Type } from '@sinclair/typebox';
import { MemberSchema } from '../../../../global/members';
import { RoleSchema } from '../../../../global';

export const ListMembersRequestQuerySchema = Type.Object({
  organizationId: Type.Optional(Type.String()),
  userId: Type.Optional(Type.String()),
  role: Type.Optional(RoleSchema),
  page: Type.Integer({
    minimum: 1,
    default: 1,
  }),
  pageSize: Type.Integer({
    default: 10,
  }),
});

export type ListMembersRequestQueryType = Static<typeof ListMembersRequestQuerySchema>;

export const ListMembersResponseSchema = Type.Object({
  data: Type.Array(MemberSchema),
  page: Type.Integer(),
  pageSize: Type.Integer(),
  total: Type.Integer(),
});

export type ListMembersResponseSchemaType = Static<typeof ListMembersResponseSchema>;
