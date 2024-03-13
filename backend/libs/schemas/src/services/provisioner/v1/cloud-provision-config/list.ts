import { type Static, Type } from '@sinclair/typebox';
import { CloudProvisionConfigSchema, SupportedCloudProviderSchema } from '../../../../global';

export const CloudProvisionConfigListQuerySchema = Type.Object({
  page: Type.Optional(Type.Number({ default: 1 })),
  pageSize: Type.Optional(Type.Number({ default: 10 })),
  cloudProvider: Type.Optional(SupportedCloudProviderSchema),
  deploymentConfigVersion: Type.Optional(Type.Number()),
});

export type CloudProvisionConfigListQuerySchemaType = Static<typeof CloudProvisionConfigListQuerySchema>;

export const CloudProvisionConfigListResponseSchema = Type.Object({
  data: Type.Array(CloudProvisionConfigSchema),
  page: Type.Integer(),
  pageSize: Type.Integer(),
  total: Type.Integer(),
});

export type CloudProvisionConfigListResponseSchemaType = Static<typeof CloudProvisionConfigListResponseSchema>;