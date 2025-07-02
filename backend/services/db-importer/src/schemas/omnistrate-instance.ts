import { SupportedCloudProviderSchema } from '@falkordb/schemas/global';
import { type Static, Type } from '@sinclair/typebox';

export const OmnistrateInstanceSchema = Type.Object({
  id: Type.String(),
  clusterId: Type.String(),
  region: Type.String(),
  userId: Type.String(),
  createdDate: Type.String(),
  serviceId: Type.String(),
  environmentId: Type.String(),
  tls: Type.Boolean(),
  resourceId: Type.String(),
  cloudProvider: SupportedCloudProviderSchema,
  status: Type.Union([
    Type.Literal('RUNNING'),
    Type.Literal('FAILED'),
    Type.Literal('STOPPED'),
    Type.Literal('DEPLOYING'),
  ]),
  productTierName: Type.String(),
  deploymentType: Type.Union([
    Type.Literal('Standalone'),
    Type.Literal('Single-Zone'),
    Type.Literal('Multi-Zone'),
    Type.Literal('Cluster-Multi-Zone'),
    Type.Literal('Cluster-Single-Zone'),
  ]),
  subscriptionId: Type.String(),
  aofEnabled: Type.Boolean(),
  podIds: Type.Array(Type.String()),
});

export type OmnistrateInstanceSchemaType = Static<typeof OmnistrateInstanceSchema>;
