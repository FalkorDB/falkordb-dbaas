import { type Static, Type } from '@sinclair/typebox';
import { AuthTokenSchema } from '../../../../global';

export const VerifyTokenRequestQuerySchema = Type.Object({
  token: Type.String(),
});

export type VerifyTokenRequestQuerySchemaType = Static<typeof VerifyTokenRequestQuerySchema>;

export const VerifyTokenResponseSuccessSchema = AuthTokenSchema;

export type VerifyTokenResponseSuccessSchemaType = Static<typeof VerifyTokenResponseSuccessSchema>;
