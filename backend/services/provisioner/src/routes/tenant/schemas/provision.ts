import { type Static, Type } from '@sinclair/typebox';
import { SUPPORTED_CLOUD_PROVIDERS, SUPPORTED_REGIONS } from '../../../constants';
import { CreateOperationParamsSchema } from '../../../schemas/operation';
import { TenantReplicationConfigurationSchema, TierIdSchema } from '../../../schemas/tenant';

export const TenantProvisionHeadersSchema = Type.Object({
  'x-falkordb-userId': Type.String(),
  'x-falkordb-organizationId': Type.String(),
});

export type TenantProvisionHeadersSchemaType = Static<typeof TenantProvisionHeadersSchema>;

export const TenantProvisionBodySchema = Type.Object({
  name: Type.String(),
  cloudProvider: Type.Union(SUPPORTED_CLOUD_PROVIDERS.map((provider) => Type.Literal(provider))),
  region: Type.Union(
    Object.values(SUPPORTED_REGIONS)
      .flat()
      .map((region) => Type.Literal(region)),
  ),
  clusterDeploymentVersion: Type.Number(),
  tierId: TierIdSchema,
  replicationConfiguration: TenantReplicationConfigurationSchema,
  billingAccountId: Type.Optional(Type.String()),
  backupSchedule: Type.String({ default: '0 0 * * *' }),
});

export type TenantProvisionBodySchemaType = Static<typeof TenantProvisionBodySchema>;

export const TenantProvisionResponseSchema = CreateOperationParamsSchema;

export type TenantProvisionResponseSchemaType = Static<typeof TenantProvisionResponseSchema>;
