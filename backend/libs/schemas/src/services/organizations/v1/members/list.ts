import { type Static, Type } from '@sinclair/typebox';
import { MemberSchema } from '../../../../global/members';

export const ListMembersRequestParamsSchema = Type.Object({
  organizationId: Type.String(),
});

export type ListMembersRequestParamsType = Static<typeof ListMembersRequestParamsSchema>;

export const ListMembersRequestQuerySchema = Type.Object({
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
