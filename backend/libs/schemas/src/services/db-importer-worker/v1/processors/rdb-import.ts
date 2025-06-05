import { type Static, Type } from '@sinclair/typebox';
import { SupportedCloudProviderSchema } from '../../../../global';

export const RdbImportValidateRDBSizeProcessorDataSchema = Type.Object({
  taskId: Type.String(),
  bucketName: Type.String(),
  fileName: Type.String(),
  projectId: Type.String(),
  cloudProvider: SupportedCloudProviderSchema,
  clusterId: Type.String(),
  region: Type.String(),
  namespace: Type.String(),
  jobResultFileName: Type.String(),
});
export type RdbImportValidateRDBSizeProcessorData = Static<typeof RdbImportValidateRDBSizeProcessorDataSchema>;

export const RdbImportValidateRDBFormatProcessorDataSchema = Type.Object({
  taskId: Type.String(),
  bucketName: Type.String(),
  fileName: Type.String(),
  projectId: Type.String(),
  cloudProvider: SupportedCloudProviderSchema,
  clusterId: Type.String(),
  region: Type.String(),
  namespace: Type.String(),
  jobResultFileName: Type.String(),
});
export type RdbImportValidateRDBFormatProcessorData = Static<typeof RdbImportValidateRDBFormatProcessorDataSchema>;

export const RdbImportMonitorFormatValidationProgressProcessorDataSchema = Type.Object({
  taskId: Type.String(),
  projectId: Type.String(),
  cloudProvider: SupportedCloudProviderSchema,
  clusterId: Type.String(),
  region: Type.String(),
  namespace: Type.String(),
  bucketName: Type.String(),
  jobResultFileName: Type.String(),
});
export type RdbImportMonitorFormatValidationProgressProcessorData = Static<typeof RdbImportMonitorFormatValidationProgressProcessorDataSchema>;

export const RdbImportMonitorSizeValidationProgressProcessorDataSchema = Type.Object({
  taskId: Type.String(),
  projectId: Type.String(),
  cloudProvider: SupportedCloudProviderSchema,
  clusterId: Type.String(),
  region: Type.String(),
  namespace: Type.String(),
  bucketName: Type.String(),
  jobResultFileName: Type.String(),
  maxRdbSize: Type.Number(),
});
export type RdbImportMonitorSizeValidationProgressProcessorData = Static<typeof RdbImportMonitorSizeValidationProgressProcessorDataSchema>;

export const RdbImportSendSaveCommandProcessorDataSchema = Type.Object({
  taskId: Type.String(),
  cloudProvider: SupportedCloudProviderSchema,
  clusterId: Type.String(),
  region: Type.String(),
  instanceId: Type.String(),
  podIds: Type.Array(Type.String()),
  hasTLS: Type.Boolean(),
  aofEnabled: Type.Boolean(),
});
export type RdbImportSendSaveCommandProcessorData = Static<typeof RdbImportSendSaveCommandProcessorDataSchema>;

export const RdbImportMonitorSaveProgressProcessorDataSchema = Type.Object({
  taskId: Type.String(),
  cloudProvider: SupportedCloudProviderSchema,
  clusterId: Type.String(),
  region: Type.String(),
  instanceId: Type.String(),
  podIds: Type.Array(Type.String()),
  hasTLS: Type.Boolean(),
  aofEnabled: Type.Boolean(),
});
export type RdbImportMonitorSaveProgressProcessorData = Static<typeof RdbImportMonitorSaveProgressProcessorDataSchema>;

export const RdbImportMakeLocalBackupProcessorDataSchema = Type.Object({
  taskId: Type.String(),
  cloudProvider: SupportedCloudProviderSchema,
  clusterId: Type.String(),
  region: Type.String(),
  instanceId: Type.String(),
  podIds: Type.Array(Type.String()),
  aofEnabled: Type.Boolean(),
  backupPath: Type.String(),
});

export type RdbImportMakeLocalBackupProcessorData = Static<typeof RdbImportMakeLocalBackupProcessorDataSchema>;

export const RdbImportFlushInstanceProcessorDataSchema = Type.Object({
  taskId: Type.String(),
  cloudProvider: SupportedCloudProviderSchema,
  clusterId: Type.String(),
  region: Type.String(),
  instanceId: Type.String(),
  podId: Type.String(),
  hasTLS: Type.Boolean(),
  isCluster: Type.Boolean(),
  aofEnabled: Type.Boolean(),
});
export type RdbImportFlushInstanceProcessorData = Static<typeof RdbImportFlushInstanceProcessorDataSchema>;

export const RdbImportRequestRDBImportProcessorDataSchema = Type.Object({
  projectId: Type.String(),
  taskId: Type.String(),
  cloudProvider: SupportedCloudProviderSchema,
  clusterId: Type.String(),
  region: Type.String(),
  instanceId: Type.String(),
  podId: Type.String(),
  hasTLS: Type.Boolean(),
  bucketName: Type.String(),
  fileName: Type.String(),
});
export type RdbImportRequestRDBImportProcessorData = Static<typeof RdbImportRequestRDBImportProcessorDataSchema>;

export const RdbImportMonitorImportRDBProcessorDataSchema = Type.Object({
  taskId: Type.String(),
  projectId: Type.String(),
  cloudProvider: SupportedCloudProviderSchema,
  clusterId: Type.String(),
  region: Type.String(),
  namespace: Type.String(),
  podIds: Type.Array(Type.String()),
  aofEnabled: Type.Boolean(),
  backupPath: Type.String(),
});
export type RdbImportMonitorImportRDBProcessorData = Static<typeof RdbImportMonitorImportRDBProcessorDataSchema>;

export const RdbImportValidateImportKeyNumberProcessorDataSchema = Type.Object({
  taskId: Type.String(),
  cloudProvider: SupportedCloudProviderSchema,
  clusterId: Type.String(),
  region: Type.String(),
  instanceId: Type.String(),
  podIds: Type.Array(Type.String()),
  hasTLS: Type.Boolean(),
  backupPath: Type.String(),
  aofEnabled: Type.Boolean(),
  isCluster: Type.Boolean(),
});
export type RdbImportValidateImportKeyNumberProcessorData = Static<typeof RdbImportValidateImportKeyNumberProcessorDataSchema>;

export const RdbImportDeleteLocalBackupProcessorDataSchema = Type.Object({
  taskId: Type.String(),
  cloudProvider: SupportedCloudProviderSchema,
  clusterId: Type.String(),
  region: Type.String(),
  instanceId: Type.String(),
  podId: Type.String(),
  backupPath: Type.String(),
});
export type RdbImportDeleteLocalBackupProcessorData = Static<typeof RdbImportDeleteLocalBackupProcessorDataSchema>;

export const RdbImportRecoverFailedImportProcessorDataSchema = Type.Object({
  taskId: Type.String(),
  cloudProvider: SupportedCloudProviderSchema,
  clusterId: Type.String(),
  region: Type.String(),
  instanceId: Type.String(),
  podIds: Type.Array(Type.String()),
  aofEnabled: Type.Boolean(),
  backupPath: Type.String(),
});

export type RdbImportRecoverFailedImportProcessorData = Static<typeof RdbImportRecoverFailedImportProcessorDataSchema>;

export enum RdbImportTaskNames {
  RdbImportValidateRDBSize = 'rdb-import-validate-rdb-size',
  RdbImportValidateRDBFormat = 'rdb-import-validate-rdb-format',
  RdbImportMonitorSizeValidationProgress = 'rdb-import-monitor-size-validation-progress',
  RdbImportMonitorFormatValidationProgress = 'rdb-import-monitor-format-validation-progress',
  RdbImportSendSaveCommand = 'rdb-import-send-save-command',
  RdbImportMonitorSaveProgress = 'rdb-import-monitor-save-progress',
  RdbImportMakeLocalBackup = 'rdb-import-make-local-backup',
  RdbImportFlushInstance = 'rdb-import-flush-instance',
  RdbImportRequestRDBImport = 'rdb-import-request-rdb-import',
  RdbImportMonitorImportRDB = 'rdb-import-monitor-import-rdb',
  RdbImportValidateImportKeyNumber = 'rdb-import-validate-import-key-number',
  RdbImportDeleteLocalBackup = 'rdb-import-delete-local-backup',
  RdbImportRecoverFailedImport = 'rdb-import-recover-failed-import',

}

export const RdbImportSchemaMap = {
  [RdbImportTaskNames.RdbImportValidateRDBSize]: RdbImportValidateRDBSizeProcessorDataSchema,
  [RdbImportTaskNames.RdbImportValidateRDBFormat]: RdbImportValidateRDBFormatProcessorDataSchema,
  [RdbImportTaskNames.RdbImportMonitorSizeValidationProgress]: RdbImportMonitorSizeValidationProgressProcessorDataSchema,
  [RdbImportTaskNames.RdbImportMonitorFormatValidationProgress]: RdbImportMonitorFormatValidationProgressProcessorDataSchema,
  [RdbImportTaskNames.RdbImportSendSaveCommand]: RdbImportSendSaveCommandProcessorDataSchema,
  [RdbImportTaskNames.RdbImportMonitorSaveProgress]: RdbImportMonitorSaveProgressProcessorDataSchema,
  [RdbImportTaskNames.RdbImportMakeLocalBackup]: RdbImportMakeLocalBackupProcessorDataSchema,
  [RdbImportTaskNames.RdbImportFlushInstance]: RdbImportFlushInstanceProcessorDataSchema,
  [RdbImportTaskNames.RdbImportRequestRDBImport]: RdbImportRequestRDBImportProcessorDataSchema,
  [RdbImportTaskNames.RdbImportMonitorImportRDB]: RdbImportMonitorImportRDBProcessorDataSchema,
  [RdbImportTaskNames.RdbImportValidateImportKeyNumber]: RdbImportValidateImportKeyNumberProcessorDataSchema,
  [RdbImportTaskNames.RdbImportDeleteLocalBackup]: RdbImportDeleteLocalBackupProcessorDataSchema,
  [RdbImportTaskNames.RdbImportRecoverFailedImport]: RdbImportRecoverFailedImportProcessorDataSchema,
} as const;