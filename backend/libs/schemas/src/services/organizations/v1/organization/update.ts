import { type Static, Type } from '@sinclair/typebox';
import { OrganizationSchema } from '../../../../../../../libs/schemas/src/global/organization';

/****** Update organization *****/

export const UpdateOrganizationRequestParamsSchema = Type.Object({
  organizationId: Type.String(),
});

export type UpdateOrganizationRequestParamsType = Static<typeof UpdateOrganizationRequestParamsSchema>;

export const UpdateOrganizationRequestBodySchema = Type.Object({
  name: Type.String(),
});

export type UpdateOrganizationRequestBodyType = Static<typeof UpdateOrganizationRequestBodySchema>;

export const UpdateOrganizationResponseSchema = OrganizationSchema;

export type UpdateOrganizationResponseSchemaType = Static<typeof UpdateOrganizationResponseSchema>;
