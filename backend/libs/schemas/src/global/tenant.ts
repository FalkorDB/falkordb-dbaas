import { type Static, Type } from '@sinclair/typebox';
import { SupportedCloudProviderSchema } from './cloudProviders';
import { SupportedRegionsSchema } from './regions';
import { TierIdSchema } from './tier';

export const TenantStatusSchema = Type.Union([
  Type.Literal('provisioning'),
  Type.Literal('provisioning-failed'),
  Type.Literal('ready'),
  Type.Literal('deleting'),
  Type.Literal('deleted'),
  Type.Literal('deleting-failed'),
  Type.Literal('upgrading'),
  Type.Literal('upgrading-failed'),
  Type.Literal('refreshing'),
]);

export type TenantStatusSchemaType = Static<typeof TenantStatusSchema>;

export const TenantReplicationConfigurationSchema = Type.Object(
  {
    enabled: Type.Boolean(),
    multiZone: Type.Boolean(),
    replicas: Type.Number(),
  },
  {
    default: {
      enabled: false,
      multiZone: false,
      replicas: 0,
    },
  },
);

export type TenantReplicationConfigurationSchemaType = Static<typeof TenantReplicationConfigurationSchema>;

export const TenantSchema = Type.Object({
  id: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),

  name: Type.String(),
  tenantGroupId: Type.String(),
  cloudProvider: SupportedCloudProviderSchema,
  region: SupportedRegionsSchema,
  clusterName: Type.String(),

  tierId: TierIdSchema,
  domain: Type.Optional(Type.String()),
  port: Type.Optional(Type.String()),

  replicationConfiguration: TenantReplicationConfigurationSchema,
  backupSchedule: Type.String({ default: '0 0 * * *' }),

  organizationId: Type.String(),
  creatorUserId: Type.String(),
  billingAccountId: Type.Optional(Type.String()),

  status: TenantStatusSchema,
});

export type TenantSchemaType = Static<typeof TenantSchema>;

export const TenantConnectionDetailsSchema = Type.Object({
  tenantId: Type.String(),
  instances: Type.Array(
    Type.Object({
      id: Type.String(),
      role: Type.Union([Type.Literal('master'), Type.Literal('replica'), Type.Literal('sentinel')]),
      host: Type.String(),
      port: Type.Number(),
      domain: Type.String(),
      masterPassword: Type.String(),
      connectionUrl: Type.String(),
    }),
  ),
});

export const CreateTenantSchema = Type.Object({
  name: Type.String(),
  tenantGroupId: Type.String(),
  cloudProvider: SupportedCloudProviderSchema,
  region: SupportedRegionsSchema,
  clusterName: Type.String(),

  tierId: TierIdSchema,

  replicationConfiguration: TenantReplicationConfigurationSchema,
  backupSchedule: Type.String({ default: '0 0 * * *' }),

  organizationId: Type.String(),
  creatorUserId: Type.String(),
  billingAccountId: Type.Optional(Type.String()),

  status: TenantStatusSchema,
});

export type CreateTenantSchemaType = Static<typeof CreateTenantSchema>;
