import * as Yup from 'yup';

export enum TaskTypes {
  SingleShardRDBExport = 'SingleShardRDBExport',
  MultiShardRDBExport = 'MultiShardRDBExport',
  RDBImport = 'RDBImport',
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
  readUrl: Yup.string().optional(),
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
    fileName: Yup.string().required(),
  }).required(),
  nodes: Yup.array().of(
    Yup.object({
      podId: Yup.string().required(),
      partFileName: Yup.string().required(),
    }).required()
  ).required(),
}).strict().noUnknown().required();
export type MultiShardRDBExportPayloadType = Yup.InferType<typeof MultiShardRDBExportPayload>;

export const RDBImportPayload = Yup.object({
  cloudProvider: Yup.string().oneOf(['gcp', 'aws']).required(),
  region: Yup.string().required(),
  clusterId: Yup.string().required(),
  instanceId: Yup.string().required(),
  podIds: Yup.array(Yup.string()).required(),
  hasTLS: Yup.boolean().required(),
  bucketName: Yup.string().required(),
  fileName: Yup.string().required(),
  rdbSizeFileName: Yup.string().required(),
  rdbKeyNumberFileName: Yup.string().required(),
  deploymentSizeInMb: Yup.number().required(),
  backupPath: Yup.string().required(),
  aofEnabled: Yup.boolean().required(),
  isCluster: Yup.boolean().required(),
}).strict().noUnknown().required();

export type RDBImportPayloadType = Yup.InferType<typeof RDBImportPayload>;

export const RDBImportOutput = Yup.object({
  numberOfKeys: Yup.number().optional(),
}).strict().noUnknown().optional();

export type RDBImportOutputType = Yup.InferType<typeof RDBImportOutput>;

export interface IExportRDBTask {
  taskId: string;
  type: TaskTypes;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error?: string;
  payload: SingleShardRDBExportPayloadType | MultiShardRDBExportPayloadType | RDBImportPayloadType;
  output?: RDBExportOutputType | RDBImportOutputType;
}

export const RDBTask: Yup.ObjectSchema<IExportRDBTask> = Yup.object({
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
      case TaskTypes.RDBImport:
        return RDBImportPayload;
      default:
        return Yup.object().noUnknown();
    }
  }),
  output: Yup.lazy((_, opt) => {
    if (opt.parent.type === TaskTypes.SingleShardRDBExport || opt.parent.type === TaskTypes.MultiShardRDBExport) {
      return RDBExportOutput;
    }
    if (opt.parent.type === TaskTypes.RDBImport) {
      return RDBImportOutput;
    }
    return Yup.object().noUnknown().optional();
  })
}).strict().noUnknown().required();

export type RDBTaskType = Yup.InferType<typeof RDBTask>;
