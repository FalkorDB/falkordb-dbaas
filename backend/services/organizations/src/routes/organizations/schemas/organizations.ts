import { Type, type Static } from '@sinclair/typebox';
import { OrganizationSchema } from '../../../schemas/organization';

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

/****** Create organization *****/

export const CreateOrganizationRequestHeadersSchema = Type.Object({
  'x-falkordb-userId': Type.String(),
});

export type CreateOrganizationRequestHeadersType = Static<typeof CreateOrganizationRequestHeadersSchema>;

export const CreateOrganizationRequestBodySchema = Type.Object({
  name: Type.String(),
});

export type CreateOrganizationRequestBodyType = Static<typeof CreateOrganizationRequestBodySchema>;

export const CreateOrganizationResponseSchema = OrganizationSchema;

export type CreateOrganizationResponseType = Static<typeof CreateOrganizationResponseSchema>;
