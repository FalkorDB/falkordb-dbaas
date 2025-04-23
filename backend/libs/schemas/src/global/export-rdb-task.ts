import { type Static, Type } from '@sinclair/typebox';
import { SupportedCloudProviderSchema } from '.';


export const TaskTypesSchema = Type.Union([
  Type.Literal('SingleShardRDBExport'),
  Type.Literal('MultiShardRDBExport'),
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
  error: Type.Optional(Type.String()),
  payload: RDBExportTaskPayloadSchema,
  output: Type.Optional(RDBExportOutputSchema),
});
export type ExportRDBTaskType = Static<typeof ExportRDBTaskSchema>;