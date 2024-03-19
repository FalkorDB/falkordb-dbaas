import { type Static, Type } from '@sinclair/typebox';

export const AuthTokenClaimsSchema = Type.Object({
  name: Type.String(),
  email: Type.String(),
});

export type AuthTokenClaimsSchemaType = Static<typeof AuthTokenClaimsSchema>;

export const AuthTokenSchema = Type.Object({
  alg: Type.String(),
  iss: Type.String(),
  sub: Type.String(),
  aud: Type.String(),
  iat: Type.Number(),
  exp: Type.Number(),
  uid: Type.String(),
  claims: AuthTokenClaimsSchema,
});

export type AuthTokenSchemaType = Static<typeof AuthTokenSchema>;
