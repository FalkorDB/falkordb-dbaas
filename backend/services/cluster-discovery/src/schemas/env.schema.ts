import { Static, Type } from '@sinclair/typebox';

export const EnvSchema = Type.Object({
  // Service configuration
  SERVICE_NAME: Type.String({ default: 'cluster-discovery' }),
  NODE_ENV: Type.Union([Type.Literal('development'), Type.Literal('production'), Type.Literal('test')], {
    default: 'production',
  }),
  PORT: Type.Number({ default: 3000 }),
  REQUEST_TIMEOUT_MS: Type.Number({ default: 30000 }),

  // Scanner configuration
  SCAN_INTERVAL_MS: Type.Number({ default: 120000 }),

  // GCP configuration
  GOOGLE_CLOUD_PROJECT: Type.String(),
  APPLICATION_PLANE_GOOGLE_CLOUD_PROJECT: Type.String(),

  // AWS configuration
  AWS_ROLE_ARN: Type.String(),
  AWS_TARGET_AUDIENCE: Type.String(),

  // Azure configuration (optional)
  AZURE_SUBSCRIPTION_ID: Type.Optional(Type.String()),
  AZURE_TENANT_ID: Type.Optional(Type.String()),
  AZURE_CLIENT_ID: Type.Optional(Type.String()),
  AZURE_CLIENT_SECRET: Type.Optional(Type.String()),
  AAD_SERVER_APPLICATION_ID: Type.Optional(Type.String()),
  AAD_SERVICE_PRINCIPAL_CLIENT_ID: Type.Optional(Type.String()),
  AAD_SERVICE_PRINCIPAL_CLIENT_SECRET: Type.Optional(Type.String()),

  // Bastion cluster configuration
  BASTION_CLUSTER_NAME: Type.String(),
  BASTION_CLUSTER_REGION: Type.String(),
  BASTION_NAMESPACE: Type.String({ default: 'bootstrap' }),
  BASTION_POD_LABEL: Type.String({ default: 'app.kubernetes.io/instance=bootstrap-dataplane-worker' }),
  BASTION_CONTAINER_NAME: Type.String({ default: 'bootstrap-dataplane-worker' }),

  // Omnistrate configuration
  OMNISTRATE_USER: Type.String(),
  OMNISTRATE_PASSWORD: Type.String(),
  OMNISTRATE_SERVICE_ID: Type.String(),
  OMNISTRATE_ENVIRONMENT_ID: Type.String(),
  OMNISTRATE_BYOC_PRODUCT_TIER_ID: Type.String(),

  // PagerDuty configuration
  PAGERDUTY_INTEGRATION_KEY: Type.String(),

  // Discovery configuration
  WHITELIST_CLUSTERS: Type.Optional(Type.String()),
  BLACKLIST_CLUSTERS: Type.Optional(Type.String()),
  DELETE_UNKNOWN_SECRETS: Type.Boolean({ default: false }),

  // Webhook authentication
  OMNISTRATE_WEBHOOK_TOKEN: Type.String(),

  // OpenTelemetry configuration
  OTEL_ENABLED: Type.Boolean({ default: false }),
});

export type EnvConfig = Static<typeof EnvSchema>;

declare module 'fastify' {
  interface FastifyInstance {
    config: EnvConfig;
  }
}
