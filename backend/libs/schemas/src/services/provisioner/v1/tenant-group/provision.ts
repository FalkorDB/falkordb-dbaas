import { type Static, Type } from '@sinclair/typebox';
import { CreateOperationParamsSchema, SupportedCloudProviderSchema, SupportedRegionsSchema } from '../../../../global';

export const TenantGroupProvisionBodySchema = Type.Object({
  cloudProvider: SupportedCloudProviderSchema,
  region: SupportedRegionsSchema,
  clusterDeploymentVersion: Type.Number(),
});

export type TenantGroupProvisionBodySchemaType = Static<typeof TenantGroupProvisionBodySchema>;

export const TenantGroupProvisionResponseSchema = CreateOperationParamsSchema;

export type TenantGroupProvisionResponseSchemaType = Static<typeof TenantGroupProvisionResponseSchema>;
