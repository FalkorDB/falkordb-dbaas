import RdbExportRequestReadSignedURLProcessor from './RdbExportRequestReadSignedURL';
import RdbExportSendSaveCommandProcessor from './RdbExportSendSaveCommandProcessor';
import RdbExportMonitorSaveProgressProcessor from './RdbExportMonitorSaveProgressProcessor';
import RdbExportCopyRDBToBucketProcessor from './RdbExportCopyRDBToBucketProcessor';
import RdbExportMonitorRDBMergeProcessor from './RdbExportMonitorRDBMergeProcessor';
import RdbExportRequestRDBMergeProcessor from './RdbExportRequestRDBMergeProcessor';
import PlaceholderProcessor from './PlaceholderProcessor';
import { FlowChildJob, FlowJob, JobsOptions, Processor } from 'bullmq';
import { AnyObject, ObjectSchema, InferType } from 'yup'

type IProcessorType = {
  name: string;
  processor: Processor;
  concurrency?: number;
  schema: ObjectSchema<AnyObject>;
}

export default [
  RdbExportRequestReadSignedURLProcessor,
  RdbExportSendSaveCommandProcessor,
  RdbExportMonitorSaveProgressProcessor,
  RdbExportCopyRDBToBucketProcessor,
  RdbExportMonitorRDBMergeProcessor,
  RdbExportRequestRDBMergeProcessor,
  PlaceholderProcessor
] as IProcessorType[];

function makeJobNode<T extends IProcessorType>(
  processor: T,
  data?: InferType<T['schema']>,
  opts: JobsOptions = { failParentOnFailure: true },
  children?: FlowChildJob[],
): FlowJob {
  return {
    name: processor.name,
    queueName: processor.name,
    data,
    children,
    opts,
  }
}

export {
  makeJobNode,
  RdbExportRequestReadSignedURLProcessor,
  RdbExportSendSaveCommandProcessor,
  RdbExportMonitorSaveProgressProcessor,
  RdbExportCopyRDBToBucketProcessor,
  RdbExportMonitorRDBMergeProcessor,
  RdbExportRequestRDBMergeProcessor,
  PlaceholderProcessor
}