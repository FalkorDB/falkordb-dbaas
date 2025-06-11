import { type Static, Type } from '@sinclair/typebox';

export const EnvSchema = Type.Object({
  NODE_ENV: Type.String({ default: 'development' }),
  PORT: Type.Number({ default: 3000 }),
  OMNISTRATE_USER: Type.String(),
  OMNISTRATE_PASSWORD: Type.String(),
  OMNISTRATE_SERVICE_ID: Type.String(),
  OMNISTRATE_ENVIRONMENT_ID: Type.String(),
  OMNISTRATE_FREE_PRODUCT_TIER_ID: Type.String(),
  OMNISTRATE_STARTUP_PRODUCT_TIER_ID: Type.String(),
  OMNISTRATE_PRO_PRODUCT_TIER_ID: Type.String(),
  OMNISTRATE_ENTERPRISE_PRODUCT_TIER_ID: Type.String(),
  OMNISTRATE_CREATE_FREE_INSTANCE_PATH: Type.String(),
  OMNISTRATE_FREE_RESOURCE_ID: Type.String(),
  OMNISTRATE_SERVICE_ACCOUNT_SECRET: Type.String(),
  BREVO_API_KEY: Type.String(),
  DRY_RUN: Type.Boolean({ default: true }),
  COMMIT_BACKEND_BASE_URL: Type.String({ default: 'http://localhost' }),
});

export type EnvSchemaType = Static<typeof EnvSchema>;
