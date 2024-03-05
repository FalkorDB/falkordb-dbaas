import { type Static, Type } from '@sinclair/typebox';
import { SupportedCloudProviderSchema } from './global';
import { OperationProviderSchema } from './operation';
import { TierIdSchema } from './tenant';

export const CloudProvisionConfigSchema = Type.Object({
  id: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
  deploymentConfigVersion: Type.Number(),

  cloudProvider: SupportedCloudProviderSchema,
  cloudProviderConfig: Type.Any(),

  tenantGroupConfig: Type.Object({
    dnsDomain: Type.String(),
    forceDestroyBackupBucket: Type.Boolean(),
    clusterDeletionProtection: Type.Boolean(),
    source: Type.Object({
      url: Type.String(),
      dir: Type.String(),
      revision: Type.String(),
    }),
    veleroRoleId: Type.String(),
  }),

  tenantConfig: Type.Object({
    source: Type.Object({
      url: Type.String(),
      dir: Type.String(),
      revision: Type.String(),
    }),
    falkordbVersion: Type.String(),
    tiers: Type.Record(
      TierIdSchema,
      Type.Object({
        falkordbCpu: Type.String(),
        falkordbMinCpu: Type.String(),
        falkordbMemory: Type.String(),
        falkordbMinMemory: Type.String(),
        persistenceSize: Type.String(),
      }),
    ),
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
    operationProvider: OperationProviderSchema,
  }),

  tenantGroupConfig: Type.Object({
    dnsDomain: Type.String(),
    forceDestroyBackupBucket: Type.Boolean(),
    clusterDeletionProtection: Type.Boolean(),
    source: Type.Object({
      url: Type.String(),
      dir: Type.String(),
      revision: Type.String(),
    }),
    veleroRoleId: Type.String(),
  }),

  tenantConfig: Type.Object({
    source: Type.Object({
      url: Type.String(),
      dir: Type.String(),
      revision: Type.String(),
    }),
    falkordbVersion: Type.String(),
    tiers: Type.Record(
      TierIdSchema,
      Type.Object({
        falkordbCpu: Type.String(),
        falkordbMinCpu: Type.String(),
        falkordbMemory: Type.String(),
        falkordbMinMemory: Type.String(),
        persistenceSize: Type.String(),
      }),
    ),
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
  tenantGroupConfig: Type.Object({
    dnsDomain: Type.String(),
    forceDestroyBackupBucket: Type.Boolean(),
    clusterDeletionProtection: Type.Boolean(),
    source: Type.Object({
      url: Type.String(),
      dir: Type.String(),
      revision: Type.String(),
    }),
    veleroRoleId: Type.String(),
  }),
  tenantConfig: Type.Object({
    source: Type.Object({
      url: Type.String(),
      dir: Type.String(),
      revision: Type.String(),
    }),
    falkordbVersion: Type.String(),
    tiers: Type.Record(
      TierIdSchema,
      Type.Object({
        falkordbCpu: Type.String(),
        falkordbMinCpu: Type.String(),
        falkordbMemory: Type.String(),
        falkordbMinMemory: Type.String(),
        persistenceSize: Type.String(),
      }),
    ),
  }),
});

export type CreateCloudProvisionConfigParamsSchemaType = Static<typeof CreateCloudProvisionConfigParamsSchema>;
