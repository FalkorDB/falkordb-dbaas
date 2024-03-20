import { type Static, Type } from '@sinclair/typebox';

export const EnvSchema = Type.Object({
  NODE_ENV: Type.String({ default: 'development' }),
  PORT: Type.Number({ default: 3000 }),
  MONGODB_URI: Type.String(),
  MONGODB_DB: Type.String(),
  FALKORDB_SERVER_URL: Type.String({ default: 'http://localhost:3000' }),
  FALKORDB_ORGANIZATIONS_URL: Type.String({ default: 'http://localhost:3000' }),
  FALKORDB_PROVISIONER_URL: Type.String({ default: 'http://localhost:3000' }),
  FALKORDB_USERS_URL: Type.String({ default: 'http://localhost:3000' }),
  RECAPTCHA_SECRET_KEY: Type.String({ default: '' }),
  RECOVER_PASSWORD_RETURN_URL: Type.String({ default: 'http://localhost:3000/recover-password/return' }),
  GOOGLE_CLOUD_PROJECT: Type.String({ default: '' }),
});

export type EnvSchemaType = Static<typeof EnvSchema>;
