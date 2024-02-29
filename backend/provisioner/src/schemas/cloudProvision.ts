import { type Static, Type } from '@sinclair/typebox';
import { SupportedCloudProviderSchema } from './global';

export const CloudProvisionConfigSchema = Type.Object({
  id: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
  deploymentConfigVersion: Type.Number(),

  cloudProvider: SupportedCloudProviderSchema,
  cloudProviderConfig: Type.Any(),

  source: Type.Object({
    url: Type.String(),
    dir: Type.String(),
    revision: Type.String(),
  }),

  tenantGroupConfig: Type.Object({
    dnsDomain: Type.String(),
    forceDestroyBackupBucket: Type.Boolean(),
    clusterDeletionProtection: Type.Boolean(),
  }),
});

export type CloudProvisionConfigSchemaType = Static<typeof CloudProvisionConfigSchema>;

export const CloudProvisionGCPConfigSchema = Type.Object({
  id: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
  deploymentConfigVersion: Type.Number(),

  cloudProvider: Type.Literal('gcp'),
  cloudProviderConfig: Type.Object({
    runnerProjectId: Type.String(),
    runnerServiceAccount: Type.String(),
    timeout: Type.Number(),
    stateBucket: Type.String(),
    deploymentProjectId: Type.String(),
    deploymentProvisionServiceAccount: Type.String(),
  }),

  source: Type.Object({
    url: Type.String(),
    dir: Type.String(),
    revision: Type.String(),
  }),

  tenantGroupConfig: Type.Object({
    dnsDomain: Type.String(),
    forceDestroyBackupBucket: Type.Boolean(),
    clusterDeletionProtection: Type.Boolean(),
  }),
});

export type CloudProvisionGCPConfigSchemaType = Static<typeof CloudProvisionGCPConfigSchema>;

export const CreateCloudProvisionConfigParamsSchema = Type.Object({
  deploymentConfigVersion: Type.Number(),

  cloudProvider: Type.Literal('gcp'),
  cloudProviderConfig: Type.Object({
    runnerProjectId: Type.String(),
    runnerServiceAccount: Type.String(),
    timeout: Type.Number(),
    stateBucket: Type.String(),
    deploymentProjectId: Type.String(),
    deploymentProvisionServiceAccount: Type.String(),
  }),

  source: Type.Object({
    url: Type.String(),
    dir: Type.String(),
    revision: Type.String(),
  }),

  tenantGroupConfig: Type.Object({
    dnsDomain: Type.String(),
    forceDestroyBackupBucket: Type.Boolean(),
    clusterDeletionProtection: Type.Boolean(),
  }),
});

export type CreateCloudProvisionConfigParamsSchemaType = Static<typeof CreateCloudProvisionConfigParamsSchema>;