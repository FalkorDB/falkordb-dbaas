import { type Static, Type } from '@sinclair/typebox';
import { MemberSchema } from '../../../../../global/members';

export const ListOrganizationMembersRequestParamsSchema = Type.Object({
  organizationId: Type.String(),
});

export type ListOrganizationMembersRequestParamsType = Static<typeof ListOrganizationMembersRequestParamsSchema>;

export const ListOrganizationMembersRequestQuerySchema = Type.Object({
  page: Type.Integer({
    minimum: 1,
    default: 1,
  }),
  pageSize: Type.Integer({
    default: 10,
  }),
});

export type ListOrganizationMembersRequestQueryType = Static<typeof ListOrganizationMembersRequestQuerySchema>;

export const ListOrganizationMembersResponseSchema = Type.Object({
  data: Type.Array(MemberSchema),
  page: Type.Integer(),
  pageSize: Type.Integer(),
  total: Type.Integer(),
});

export type ListOrganizationMembersResponseSchemaType = Static<typeof ListOrganizationMembersResponseSchema>;
