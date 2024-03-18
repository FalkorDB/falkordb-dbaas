import { type Static, Type } from '@sinclair/typebox';

export const EnvSchema = Type.Object({
  NODE_ENV: Type.String({ default: 'development' }),
  PORT: Type.Number({ default: 3000 }),
  MONGODB_URI: Type.String(),
  MONGODB_DB: Type.String(),
});

export type EnvSchemaType = Static<typeof EnvSchema>;