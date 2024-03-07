import { Type, type Static } from '@sinclair/typebox';
import { UserSchema } from '../../../schemas/user';

/********* Get user *********/
export const GetUserRequestParamsSchema = Type.Object({
  id: Type.String(),
});

export type GetUserRequestParamsSchemaType = Static<typeof GetUserRequestParamsSchema>;

export const GetUserResponseBodySchema = UserSchema;

export type GetUserResponseBodySchemaType = Static<typeof GetUserResponseBodySchema>;

/********* Create user *********/
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

/********* Update user *********/

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

/********* Delete user *********/
export const DeleteUserRequestParamsSchema = Type.Object({
  id: Type.String(),
});

export type DeleteUserRequestParamsSchemaType = Static<typeof DeleteUserRequestParamsSchema>;
