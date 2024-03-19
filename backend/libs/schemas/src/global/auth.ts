import { type Static, Type } from '@sinclair/typebox';

export const AuthTokenClaimsSchema = Type.Object({
  name: Type.String(),
  email: Type.String(),
});

export type AuthTokenClaimsSchemaType = Static<typeof AuthTokenClaimsSchema>;

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
  claims: AuthTokenClaimsSchema,
});

export type AuthTokenSchemaType = Static<typeof AuthTokenSchema>;
