import { type Static, Type } from '@sinclair/typebox';

export const SendForgotPasswordRequestBodySchema = Type.Object({
  email: Type.String({ format: 'email' }),

  'g-recaptcha-response': Type.String(),
});

export type SendForgotPasswordRequestBodySchemaType = Static<typeof SendForgotPasswordRequestBodySchema>;