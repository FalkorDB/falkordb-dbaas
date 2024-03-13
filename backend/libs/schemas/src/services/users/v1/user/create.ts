import { Type, type Static } from '@sinclair/typebox';
import { UserSchema } from '../../../../global';

export const CreateUserRequestParamsSchema = Type.Object({
  id: Type.String(),
});

export type CreateUserRequestParamsSchemaType = Static<typeof CreateUserRequestParamsSchema>;

export const CreateUserRequestBodySchema = Type.Object({
  email: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
});

export type CreateUserRequestBodySchemaType = Static<typeof CreateUserRequestBodySchema>;

export const CreateUserResponseBodySchema = UserSchema;

export type CreateUserResponseBodySchemaType = Static<typeof CreateUserResponseBodySchema>;
