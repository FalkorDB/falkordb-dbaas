import { Type, type Static } from '@sinclair/typebox';
import { OrganizationSchema } from '../../../../global/organization';

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
