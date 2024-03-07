import { type Static, Type } from '@sinclair/typebox';
import { UserMembershipItem } from '../../../../schemas/membership';

/********* Get memberships *********/
export const GetMembershipsRequestParamsSchema = Type.Object({
  id: Type.String(),
});

export type GetMembershipsRequestParamsSchemaType = Static<typeof GetMembershipsRequestParamsSchema>;

export const GetMembershipsRequestQuerySchema = Type.Object({
  page: Type.Optional(Type.Number({ default: 1 })),
  pageSize: Type.Optional(Type.Number({ default: 10 })),
});

export type GetMembershipsRequestQuerySchemaType = Static<typeof GetMembershipsRequestQuerySchema>;

export const GetMembershipsResponseBodySchema = Type.Array(UserMembershipItem);

export type GetMembershipsResponseBodySchemaType = Static<typeof GetMembershipsResponseBodySchema>;
