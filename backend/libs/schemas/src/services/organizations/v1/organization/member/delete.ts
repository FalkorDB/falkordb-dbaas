import { type Static, Type } from '@sinclair/typebox';

/****** Delete member *******/

export const DeleteOrganizationMemberRequestParamsSchema = Type.Object({
  organizationId: Type.String(),
  memberId: Type.String(),
});

export type DeleteOrganizationMemberRequestParamsType = Static<typeof DeleteOrganizationMemberRequestParamsSchema>;
