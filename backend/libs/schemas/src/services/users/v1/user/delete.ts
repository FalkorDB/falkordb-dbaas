import { Type, type Static } from '@sinclair/typebox';
import { UserSchema } from '../../../../global';

export const DeleteUserRequestParamsSchema = Type.Object({
  id: Type.String(),
});

export type DeleteUserRequestParamsSchemaType = Static<typeof DeleteUserRequestParamsSchema>;
