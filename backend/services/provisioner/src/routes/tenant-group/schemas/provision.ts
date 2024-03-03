import { type Static, Type } from '@sinclair/typebox';
import { SUPPORTED_CLOUD_PROVIDERS, SUPPORTED_REGIONS } from '../../../constants';
import { CreateOperationParamsSchema } from '../../../schemas/operation';

export const TenantGroupProvisionBodySchema = Type.Object({
  cloudProvider: Type.Union(SUPPORTED_CLOUD_PROVIDERS.map((provider) => Type.Literal(provider))),
  region: Type.Union(
    Object.values(SUPPORTED_REGIONS)
      .flat()
      .map((region) => Type.Literal(region)),
  ),
  clusterDeploymentVersion: Type.Number(),
});

export type TenantGroupProvisionBodySchemaType = Static<typeof TenantGroupProvisionBodySchema>;

export const TenantGroupProvisionResponseSchema = CreateOperationParamsSchema;

export type TenantGroupProvisionResponseSchemaType = Static<typeof TenantGroupProvisionResponseSchema>;
