import { type Static, Type } from '@sinclair/typebox';
import { OrganizationSchema } from '../../../../schemas/organization';

/****** Get organization *****/
export const GetOrganizationRequestParamsSchema = Type.Object({
  organizationId: Type.String(),
});

export type GetOrganizationRequestParamsType = Static<typeof GetOrganizationRequestParamsSchema>;

export const GetOrganizationResponseSchema = OrganizationSchema;

export type GetOrganizationResponseSchemaType = Static<typeof GetOrganizationResponseSchema>;

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

/****** Delete organization *****/

export const DeleteOrganizationRequestParamsSchema = Type.Object({
  organizationId: Type.String(),
});

export type DeleteOrganizationRequestParamsType = Static<typeof DeleteOrganizationRequestParamsSchema>;
