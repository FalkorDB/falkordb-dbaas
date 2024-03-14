import { type Static, Type } from '@sinclair/typebox';

/****** Delete member *******/

export const DeleteMemberRequestParamsSchema = Type.Object({
  memberId: Type.String(),
});

export type DeleteMemberRequestParamsType = Static<typeof DeleteMemberRequestParamsSchema>;
