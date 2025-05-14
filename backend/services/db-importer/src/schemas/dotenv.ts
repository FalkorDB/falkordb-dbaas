import { type Static, Type } from '@sinclair/typebox';

export const EnvSchema = Type.Object({
  NODE_ENV: Type.String({ default: 'development' }),
  PORT: Type.Number({ default: 3010 }),
  RECAPTCHA_SECRET_KEY: Type.String({ default: '' }),
});

export type EnvSchemaType = Static<typeof EnvSchema>;
