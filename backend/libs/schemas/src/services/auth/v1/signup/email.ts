import { type Static, Type } from '@sinclair/typebox';

export const SignUpWithEmailRequestBodySchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 8 }),
  firstName: Type.String(),
  lastName: Type.String(),

  'g-recaptcha-response': Type.String(),
});

export type SignUpWithEmailRequestBodySchemaType = Static<typeof SignUpWithEmailRequestBodySchema>;

export const SignUpWithEmailResponseSuccessSchema = Type.Object({
  token: Type.String(),
  refreshToken: Type.String(),
  uid: Type.String(),
  email: Type.String(),
});

export type SignUpWithEmailResponseSuccessSchemaType = Static<typeof SignUpWithEmailResponseSuccessSchema>;
