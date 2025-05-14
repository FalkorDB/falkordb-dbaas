import { type Static, Type } from '@sinclair/typebox';
import { SupportedCloudProviderSchema } from '../../../../global';

export const RdbExportCopyRDBToBucketProcessorDataSchema = Type.Object({
  taskId: Type.String(),
  instanceId: Type.String(),
  podId: Type.String(),
  region: Type.String(),
  cloudProvider: SupportedCloudProviderSchema,
  clusterId: Type.String(),
  bucketName: Type.String(),
  fileName: Type.String(),
});
export type RdbExportCopyRDBToBucketProcessorData = Static<typeof RdbExportCopyRDBToBucketProcessorDataSchema>;

export const RdbExportMonitorRDBMergeProcessorDataSchema = Type.Object({
  taskId: Type.String(),
  projectId: Type.String(),
  cloudProvider: SupportedCloudProviderSchema,
  clusterId: Type.String(),
  region: Type.String(),
  namespace: Type.String(),
});
export type RdbExportMonitorRDBMergeProcessorData = Static<typeof RdbExportMonitorRDBMergeProcessorDataSchema>;

export const RdbExportMonitorSaveProgressProcessorDataSchema = Type.Object({
  taskId: Type.String(),
  cloudProvider: SupportedCloudProviderSchema,
  clusterId: Type.String(),
  region: Type.String(),
  instanceId: Type.String(),
  podId: Type.String(),
  hasTLS: Type.Boolean(),
});
export type RdbExportMonitorSaveProgressProcessorData = Static<typeof RdbExportMonitorSaveProgressProcessorDataSchema>;

export const RdbExportRequestRDBMergeProcessorDataSchema = Type.Object({
  taskId: Type.String(),
  projectId: Type.String(),
  cloudProvider: SupportedCloudProviderSchema,
  clusterId: Type.String(),
  region: Type.String(),
  namespace: Type.String(),
  bucketName: Type.String(),
  rdbFileNames: Type.Array(Type.String()),
  outputRdbFileName: Type.String(),
});
export type RdbExportRequestRDBMergeProcessorData = Static<typeof RdbExportRequestRDBMergeProcessorDataSchema>;

export const RdbExportRequestRDBSaveProcessorDataSchema = Type.Object({
  taskId: Type.String(),
  instanceId: Type.String(),
  podId: Type.String(),
  region: Type.String(),
  cloudProvider: SupportedCloudProviderSchema,
  clusterId: Type.String(),
});
export type RdbExportRequestRDBSaveProcessorData = Static<typeof RdbExportRequestRDBSaveProcessorDataSchema>;

export const RdbExportRequestReadSignedURLProcessorDataSchema = Type.Object({
  taskId: Type.String(),
  bucketName: Type.String(),
  fileName: Type.String(),
  expiresIn: Type.Number(),
});
export type RdbExportRequestReadSignedURLProcessorData = Static<typeof RdbExportRequestReadSignedURLProcessorDataSchema>;

export const RdbExportSendSaveCommandProcessorDataSchema = Type.Object({
  taskId: Type.String(),
  cloudProvider: SupportedCloudProviderSchema,
  clusterId: Type.String(),
  region: Type.String(),
  instanceId: Type.String(),
  podId: Type.String(),
  hasTLS: Type.Boolean(),
});
export type RdbExportSendSaveCommandProcessorData = Static<typeof RdbExportSendSaveCommandProcessorDataSchema>;


export enum ExporterTaskNames {
  RdbExportCopyRdbToBucket = 'rdb-export-copy-rdb-to-bucket',
  RdbExportMonitorRDBMerge = 'rdb-export-monitor-rdb-merge',
  RdbExportMonitorSaveProgress = 'rdb-export-monitor-save-progress',
  RdbExportRequestRDBMerge = 'rdb-export-request-rdb-merge',
  RdbExportRequestRDBSave = 'rdb-export-request-rdb-save',
  RdbExportRequestReadSignedURL = 'rdb-export-request-read-signed-url',
  RdbExportSendSaveCommand = 'rdb-export-send-save-command',
}

export const ExporterSchemaMap = {
  [ExporterTaskNames.RdbExportCopyRdbToBucket]: RdbExportCopyRDBToBucketProcessorDataSchema,
  [ExporterTaskNames.RdbExportMonitorRDBMerge]: RdbExportMonitorRDBMergeProcessorDataSchema,
  [ExporterTaskNames.RdbExportMonitorSaveProgress]: RdbExportMonitorSaveProgressProcessorDataSchema,
  [ExporterTaskNames.RdbExportRequestRDBMerge]: RdbExportRequestRDBMergeProcessorDataSchema,
  [ExporterTaskNames.RdbExportRequestRDBSave]: RdbExportRequestRDBSaveProcessorDataSchema,
  [ExporterTaskNames.RdbExportRequestReadSignedURL]: RdbExportRequestReadSignedURLProcessorDataSchema,
  [ExporterTaskNames.RdbExportSendSaveCommand]: RdbExportSendSaveCommandProcessorDataSchema,
} 