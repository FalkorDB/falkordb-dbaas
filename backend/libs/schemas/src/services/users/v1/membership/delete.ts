import { type Static, Type } from '@sinclair/typebox';

/********* Delete membership *********/

export const DeleteUserMembershipRequestParamsSchema = Type.Object({
  id: Type.String(),
  membershipId: Type.String(),
});

export type DeleteUserMembershipRequestParamsSchemaType = Static<typeof DeleteUserMembershipRequestParamsSchema>;
