import { type Static, Type } from '@sinclair/typebox';

export const EnvSchema = Type.Object({
  NODE_ENV: Type.String({ default: 'development' }),
  PORT: Type.Number({ default: 3013 }),
  OMNISTRATE_EMAIL: Type.String(),
  OMNISTRATE_PASSWORD: Type.String(),
  OMNISTRATE_SERVICE_ID: Type.String(),
  OMNISTRATE_ENVIRONMENT_ID: Type.String(),
  OMNISTRATE_WEBHOOK_SECRET: Type.String(),
  JWT_SECRET: Type.String(),
  SERVICE_NAME: Type.String({ default: 'customer-ldap' }),
  CORS_ORIGINS: Type.String({ default: '*' }),
  REQUEST_TIMEOUT_MS: Type.Number({ default: 30000 }),
  LDAP_CONNECTION_TIMEOUT_MS: Type.Number({ default: 10000 }),
  K8S_PORT_FORWARD_TIMEOUT_MS: Type.Number({ default: 15000 }),
});

export type EnvSchemaType = Static<typeof EnvSchema>;
