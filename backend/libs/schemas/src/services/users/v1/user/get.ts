import { Type, type Static } from '@sinclair/typebox';
import { UserSchema } from '../../../../global';

/********* Get user *********/
export const GetUserRequestParamsSchema = Type.Object({
  id: Type.String(),
});

export type GetUserRequestParamsSchemaType = Static<typeof GetUserRequestParamsSchema>;

export const GetUserResponseBodySchema = UserSchema;

export type GetUserResponseBodySchemaType = Static<typeof GetUserResponseBodySchema>;
