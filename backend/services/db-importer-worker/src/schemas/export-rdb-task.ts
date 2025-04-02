import * as Yup from 'yup';

export const ExportRDBTask = Yup.object({
  taskId: Yup.string().required(),
  createdAt: Yup.string().required(),
  updatedAt: Yup.string().required(),
  status: Yup.string().oneOf([
    'pending',
    'in_progress',
    'completed',
    'failed',
  ]).default('pending').required(),
  error: Yup.string().optional(),
  payload: Yup.object({
    source: Yup.object({
      cloudProvider: Yup.string().oneOf(['gcp', 'aws']).required(),
      region: Yup.string().required(),
      clusterId: Yup.string().required(),
      instanceId: Yup.string().required(),
      podId: Yup.string().required(),
      hasTLS: Yup.boolean().required(),
    }).required(),
    destination: Yup.object({
      bucketName: Yup.string().required(),
      fileName: Yup.string().required(),
      expiresIn: Yup.number().required(),
    }).required(),
  }).required(),
  output: Yup.object({
    readUrl: Yup.string().optional(),
    writeUrl: Yup.string().optional(),
  }).optional(),
});

export type ExportRDBTaskType = Yup.InferType<typeof ExportRDBTask>;

export const ExportRDBTaskMessage = Yup.object({
  taskId: Yup.string().required(),
}).required();

export type ExportRDBTaskMessageType = Yup.InferType<typeof ExportRDBTaskMessage>;