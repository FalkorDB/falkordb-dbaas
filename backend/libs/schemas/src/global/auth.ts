import { type Static, Type } from '@sinclair/typebox';

export const AuthTokenSchema = Type.Object({
  alg: Type.String(),
  kid: Type.String(),
  typ: Type.String(),
  iss: Type.String(),
  sub: Type.String(),
  aud: Type.String(),
  iat: Type.Number(),
  exp: Type.Number(),
  auth_time: Type.Number(),
  user_id: Type.String(),
  email: Type.String(),
  email_verified: Type.Boolean(),
});

export type AuthTokenSchemaType = Static<typeof AuthTokenSchema>;
