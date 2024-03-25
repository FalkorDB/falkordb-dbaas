import { type Static, Type } from '@sinclair/typebox';
import {
  CreateOperationParamsSchema,
  SupportedCloudProviderSchema,
  SupportedRegionsSchema,
  TenantReplicationConfigurationSchema,
  TierIdSchema,
} from '../../../../global';

export const TenantProvisionHeadersSchema = Type.Object({
  'x-falkordb-userId': Type.String(),
  'x-falkordb-organizationId': Type.String(),
});

export type TenantProvisionHeadersSchemaType = Static<typeof TenantProvisionHeadersSchema>;

export const TenantProvisionBodySchema = Type.Object({
  name: Type.String(),
  cloudProvider: SupportedCloudProviderSchema,
  region: SupportedRegionsSchema,
  clusterDeploymentVersion: Type.Number(),
  tierId: TierIdSchema,
  replicationConfiguration: TenantReplicationConfigurationSchema,
  billingAccountId: Type.Optional(Type.String()),
  backupSchedule: Type.String({ default: '0 0 * * *' }),
});

export type TenantProvisionBodySchemaType = Static<typeof TenantProvisionBodySchema>;

export const TenantProvisionResponseSchema = CreateOperationParamsSchema;

export type TenantProvisionResponseSchemaType = Static<typeof TenantProvisionResponseSchema>;
