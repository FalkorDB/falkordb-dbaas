import { Type, type Static } from '@sinclair/typebox';
import { UserSchema } from '../../../../global';

export const UpdateUserRequestParamsSchema = Type.Object({
  id: Type.String(),
});

export type UpdateUserRequestParamsSchemaType = Static<typeof UpdateUserRequestParamsSchema>;

export const UpdateUserRequestBodySchema = Type.Object({
  email: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
});

export type UpdateUserRequestBodySchemaType = Static<typeof UpdateUserRequestBodySchema>;

export const UpdateUserResponseBodySchema = UserSchema;

export type UpdateUserResponseBodySchemaType = Static<typeof UpdateUserResponseBodySchema>;
