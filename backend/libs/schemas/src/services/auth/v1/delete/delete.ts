import { type Static, Type } from '@sinclair/typebox';

export const DeleteUserRequestParamsSchema = Type.Object({
  userId: Type.String(),
});

export type DeleteUserRequestParamsSchemaType = Static<typeof DeleteUserRequestParamsSchema>;