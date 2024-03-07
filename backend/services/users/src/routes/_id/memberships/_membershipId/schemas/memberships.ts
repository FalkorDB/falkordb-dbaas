import { type Static, Type } from '@sinclair/typebox';

/********* Delete membership *********/

export const DeleteMembershipRequestParamsSchema = Type.Object({
  id: Type.String(),
  membershipId: Type.String(),
});

export type DeleteMembershipRequestParamsSchemaType = Static<typeof DeleteMembershipRequestParamsSchema>;
