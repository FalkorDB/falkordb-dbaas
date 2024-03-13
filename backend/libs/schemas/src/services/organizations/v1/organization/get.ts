import { type Static, Type } from '@sinclair/typebox';
import { OrganizationSchema } from '../../../../global/organization';

/****** Get organization *****/
export const GetOrganizationRequestParamsSchema = Type.Object({
  organizationId: Type.String(),
});

export type GetOrganizationRequestParamsType = Static<typeof GetOrganizationRequestParamsSchema>;

export const GetOrganizationResponseSchema = OrganizationSchema;

export type GetOrganizationResponseSchemaType = Static<typeof GetOrganizationResponseSchema>;
