import { type Static, Type } from '@sinclair/typebox';
import { UserSchema } from '../../../../global';

export const GetMeRequestHeadersSchema = Type.Object({
  'x-falkordb-userId': Type.String(),
});

export type GetMeRequestHeadersSchemaType = Static<typeof GetMeRequestHeadersSchema>;

export const GetMeResponseBodySchema = UserSchema;

export type GetMeResponseBodySchemaType = Static<typeof GetMeResponseBodySchema>;
