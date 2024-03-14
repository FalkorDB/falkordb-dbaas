import { type Static, Type } from '@sinclair/typebox';
import { UserMembershipItem } from '../../../../global';

/********* Get memberships *********/
export const GetUserMembershipsRequestParamsSchema = Type.Object({
  id: Type.String(),
});

export type GetUserMembershipsRequestParamsSchemaType = Static<typeof GetUserMembershipsRequestParamsSchema>;

export const GetUserMembershipsRequestQuerySchema = Type.Object({
  page: Type.Optional(Type.Number({ default: 1 })),
  pageSize: Type.Optional(Type.Number({ default: 10 })),
});

export type GetUserMembershipsRequestQuerySchemaType = Static<typeof GetUserMembershipsRequestQuerySchema>;

export const GetUserMembershipsResponseBodySchema = Type.Array(UserMembershipItem);

export type GetUserMembershipsResponseBodySchemaType = Static<typeof GetUserMembershipsResponseBodySchema>;
