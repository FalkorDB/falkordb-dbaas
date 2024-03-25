import { type Static, Type } from '@sinclair/typebox';

export const LoginWithEmailRequestBodySchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 8 }),

  'g-recaptcha-response': Type.String(),
});

export type LoginWithEmailRequestBodySchemaType = Static<typeof LoginWithEmailRequestBodySchema>;

export const LoginWithEmailResponseSuccessSchema = Type.Object({
  token: Type.String(),
  refreshToken: Type.String(),
  uid: Type.String(),
  email: Type.String(),
});

export type LoginWithEmailResponseSuccessSchemaType = Static<typeof LoginWithEmailResponseSuccessSchema>;
