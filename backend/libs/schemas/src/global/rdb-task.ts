import { type Static, Type } from '@sinclair/typebox';
import { SupportedCloudProviderSchema } from '.';


export const TaskTypesSchema = Type.Union([
  Type.Literal('SingleShardRDBExport'),
  Type.Literal('MultiShardRDBExport'),
  Type.Literal('RDBImport')
]);
export type TaskTypesType = Static<typeof TaskTypesSchema>;

export const SingleShardRDBExportPayloadSchema = Type.Object({
  cloudProvider: SupportedCloudProviderSchema,
  region: Type.String(),
  clusterId: Type.String(),
  instanceId: Type.String(),
  podId: Type.String(),
  hasTLS: Type.Boolean(),
  destination: Type.Object({
    bucketName: Type.String(),
    fileName: Type.String(),
    expiresIn: Type.Number(),
  }),
});
export type SingleShardRDBExportPayloadType = Static<typeof SingleShardRDBExportPayloadSchema>;

export const MultiShardRDBExportPayloadSchema = Type.Object({
  cloudProvider: SupportedCloudProviderSchema,
  region: Type.String(),
  clusterId: Type.String(),
  instanceId: Type.String(),
  podId: Type.String(),
  hasTLS: Type.Boolean(),
  destination: Type.Object({
    nodes: Type.Array(
      Type.Object({
        podId: Type.String(),
        partFileName: Type.String(),
      }),
    ),
    fileName: Type.String(),
    bucketName: Type.String(),
    expiresIn: Type.Number(),
  }),
});
export type MultiShardRDBExportPayloadType = Static<typeof MultiShardRDBExportPayloadSchema>;

export const RDBExportTaskPayloadSchema = Type.Union([
  SingleShardRDBExportPayloadSchema,
  MultiShardRDBExportPayloadSchema,
]);
export type RDBExportTaskPayloadType = Static<typeof RDBExportTaskPayloadSchema>;

export const RDBExportOutputSchema = Type.Object({
  readUrl: Type.String(),
});
export type RDBExportOutputType = Static<typeof RDBExportOutputSchema>;

export const TaskStatusSchema = Type.Union([
  Type.Literal('created'),
  Type.Literal('pending'),
  Type.Literal('in_progress'),
  Type.Literal('completed'),
  Type.Literal('failed'),
]);
export type TaskStatusType = Static<typeof TaskStatusSchema>;

export const ExportRDBTaskSchema = Type.Object({
  taskId: Type.String(),
  type: TaskTypesSchema,
  createdAt: Type.String(),
  updatedAt: Type.String(),
  status: TaskStatusSchema,
  /**
   * @deprecated Use 'errors' field instead
   */
  error: Type.Optional(Type.String()),
  errors: Type.Optional(Type.Array(Type.String())),
  payload: RDBExportTaskPayloadSchema,
  output: Type.Optional(RDBExportOutputSchema),
});
export type ExportRDBTaskType = Static<typeof ExportRDBTaskSchema>;

export const RDBImportOutputSchema = Type.Object({
  numberOfKeys: Type.Optional(Type.Number()),
});
export type RDBImportOutputType = Static<typeof RDBImportOutputSchema>;

export const RDBImportTaskPayloadSchema = Type.Object({
  cloudProvider: SupportedCloudProviderSchema,
  region: Type.String(),
  clusterId: Type.String(),
  instanceId: Type.String(),
  podIds: Type.Array(Type.String()),
  hasTLS: Type.Boolean(),
  bucketName: Type.String(),
  fileName: Type.String(),
  rdbSizeFileName: Type.String(),
  rdbKeyNumberFileName: Type.String(),
  deploymentSizeInMb: Type.Number(),
  backupPath: Type.String(),
  aofEnabled: Type.Boolean(),
  isCluster: Type.Boolean(),
});
export type RDBImportTaskPayloadType = Static<typeof RDBImportTaskPayloadSchema>;

export const ImportRDBTaskSchema = Type.Object({
  taskId: Type.String(),
  type: TaskTypesSchema,
  createdAt: Type.String(),
  updatedAt: Type.String(),
  status: TaskStatusSchema,
  /**
   * @deprecated Use 'errors' field instead
   */
  error: Type.Optional(Type.String()),
  errors: Type.Optional(Type.Array(Type.String())),
  payload: RDBImportTaskPayloadSchema,
  output: Type.Optional(RDBImportOutputSchema),
});
export type ImportRDBTaskType = Static<typeof ImportRDBTaskSchema>;

export const TaskDocumentSchema = Type.Union([
  ExportRDBTaskSchema,
  ImportRDBTaskSchema,
]);

export type TaskDocumentType = ExportRDBTaskType | ImportRDBTaskType;