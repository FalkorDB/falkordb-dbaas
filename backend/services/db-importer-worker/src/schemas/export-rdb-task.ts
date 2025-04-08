import * as Yup from 'yup';

export enum TaskTypes {
  SingleShardRDBExport = 'SingleShardRDBExport',
  MultiShardRDBExport = 'MultiShardRDBExport',
}

export const SingleShardRDBExportPayload = Yup.object({
  cloudProvider: Yup.string().oneOf(['gcp', 'aws']).required(),
  region: Yup.string().required(),
  clusterId: Yup.string().required(),
  instanceId: Yup.string().required(),
  podId: Yup.string().required(),
  hasTLS: Yup.boolean().required(),
  destination: Yup.object({
    bucketName: Yup.string().required(),
    fileName: Yup.string().required(),
    expiresIn: Yup.number().required(),
  }).required(),
}).strict().noUnknown().required();

export type SingleShardRDBExportPayloadType = Yup.InferType<typeof SingleShardRDBExportPayload>;

export const RDBExportOutput = Yup.object({
  readUrls: Yup.array().of(Yup.string()).optional(),
}).strict().noUnknown().optional();
export type RDBExportOutputType = Yup.InferType<typeof RDBExportOutput>;


export const MultiShardRDBExportPayload = Yup.object({
  cloudProvider: Yup.string().oneOf(['gcp', 'aws']).required(),
  region: Yup.string().required(),
  clusterId: Yup.string().required(),
  instanceId: Yup.string().required(),
  hasTLS: Yup.boolean().required(),
  destination: Yup.object({
    bucketName: Yup.string().required(),
    expiresIn: Yup.number().required(),
  }).required(),
  nodes: Yup.array().of(
    Yup.object({
      podId: Yup.string().required(),
      partFileName: Yup.string().required(),
    }).required()
  ).required(),
}).strict().noUnknown().required();
export type MultiShardRDBExportPayloadType = Yup.InferType<typeof MultiShardRDBExportPayload>;

export interface IExportRDBTask {
  taskId: string;
  type: TaskTypes;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error?: string;
  payload: SingleShardRDBExportPayloadType | MultiShardRDBExportPayloadType;
  output?: RDBExportOutputType;
}

export const ExportRDBTask: Yup.ObjectSchema<IExportRDBTask> = Yup.object({
  taskId: Yup.string().required(),
  type: Yup.string().oneOf(Object.values(TaskTypes)).required(),
  createdAt: Yup.string().required(),
  updatedAt: Yup.string().required(),
  status: Yup.string().oneOf([
    'pending',
    'in_progress',
    'completed',
    'failed',
  ]).default('pending').required(),
  error: Yup.string().optional(),
  payload: Yup.lazy((_, opt) => {
    switch (opt.parent.type) {
      case TaskTypes.SingleShardRDBExport:
        return SingleShardRDBExportPayload;
      case TaskTypes.MultiShardRDBExport:
        return MultiShardRDBExportPayload;
      default:
        return Yup.object().noUnknown();
    }
  }),
  output: RDBExportOutput,
}).strict().noUnknown().required();

export type ExportRDBTaskType = Yup.InferType<typeof ExportRDBTask>;

export const ExportRDBTaskMessage = Yup.object({
  taskId: Yup.string().required(),
}).required();

export type ExportRDBTaskMessageType = Yup.InferType<typeof ExportRDBTaskMessage>;