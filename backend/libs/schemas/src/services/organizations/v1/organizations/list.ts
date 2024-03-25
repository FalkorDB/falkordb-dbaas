import { Type, type Static } from '@sinclair/typebox';
import { OrganizationSchema } from '../../../../global/organization';

/****** List organization *****/

export const ListOrganizationsRequestQuerySchema = Type.Object({
  page: Type.Integer({
    minimum: 1,
    default: 1,
  }),
  pageSize: Type.Integer({
    default: 10,
  }),
});

export type ListOrganizationsRequestQueryType = Static<typeof ListOrganizationsRequestQuerySchema>;

export const ListOrganizationsResponseSchema = Type.Object({
  data: Type.Array(OrganizationSchema),
  page: Type.Integer(),
  pageSize: Type.Integer(),
  total: Type.Integer(),
});

export type ListOrganizationsResponseType = Static<typeof ListOrganizationsResponseSchema>;
