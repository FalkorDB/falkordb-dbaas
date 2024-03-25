import { type Static, Type } from '@sinclair/typebox';

/****** Delete organization *****/

export const DeleteOrganizationRequestParamsSchema = Type.Object({
  organizationId: Type.String(),
});

export type DeleteOrganizationRequestParamsType = Static<typeof DeleteOrganizationRequestParamsSchema>;
