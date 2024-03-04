import { type Static, Type } from '@sinclair/typebox';
import { SupportedCloudProviderSchema, SupportedRegionsSchema } from './global';

export const TenantGroupStatusSchema = Type.Union([
  Type.Literal('provisioning'),
  Type.Literal('deprovisioning'),
  Type.Literal('upgrading'),
  Type.Literal('refreshing'),
  Type.Literal('provisioning-failed'),
  Type.Literal('deprovisioning-failed'),
  Type.Literal('upgrading-failed'),
  Type.Literal('refreshing-failed'),
  Type.Literal('ready'),
  Type.Literal('deprovisioned'),
]);

export type TenantGroupStatusSchemaType = Static<typeof TenantGroupStatusSchema>;

export const TenantGroupSchema = Type.Object({
  id: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
  schemaVersion: Type.Number(),

  status: TenantGroupStatusSchema,

  cloudProvider: SupportedCloudProviderSchema,
  region: SupportedRegionsSchema,
  clusterDeploymentVersion: Type.Number({
    minimum: 1,
    maximum: 1,
    default: 1,
  }),
  cloudProvisionConfigId: Type.Optional(Type.String()),
  clusterName: Type.Optional(Type.String()),
  clusterDomain: Type.Optional(Type.String()),
  vpcName: Type.Optional(Type.String()),
  clusterEndpoint: Type.Optional(Type.String()),
  clusterCaCertificate: Type.Optional(Type.String()),
  ipAddress: Type.Optional(Type.String()),
  backupBucketName: Type.Optional(Type.String()),

  tenantCount: Type.Number(),
  tenants: Type.Array(
    Type.Object({
      id: Type.String(),
      position: Type.Number(),
      name: Type.String(),
    }),
  ),
  maxTenants: Type.Number(),
});

export type TenantGroupSchemaType = Static<typeof TenantGroupSchema>;

export const TenantGroupCreateSchema = Type.Omit(TenantGroupSchema, [
  'createdAt',
  'updatedAt',
  'clusterName',
  'clusterDomain',
  'tenantCount',
  'tenants',
]);

export type TenantGroupCreateSchemaType = Static<typeof TenantGroupCreateSchema>;
