import { type Static, Type } from '@sinclair/typebox';
import { SupportedCloudProviderSchema } from '../../../../global';

export const CloudProvisionConfigListQuerySchema = Type.Object({
  page: Type.Optional(Type.Number({ default: 1 })),
  pageSize: Type.Optional(Type.Number({ default: 10 })),
  cloudProvider: Type.Optional(SupportedCloudProviderSchema),
  deploymentConfigVersion: Type.Optional(Type.Number()),
});

export type CloudProvisionConfigListQuerySchemaType = Static<typeof CloudProvisionConfigListQuerySchema>;
