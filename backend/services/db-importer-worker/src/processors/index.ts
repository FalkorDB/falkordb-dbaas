import { Static, TSchema } from '@sinclair/typebox';
import { FlowChildJob, FlowJob, JobsOptions, Processor } from 'bullmq';
import RdbExportRequestReadSignedURLProcessor from './RdbExportRequestReadSignedURL';
import RdbExportSendSaveCommandProcessor from './RdbExportSendSaveCommandProcessor';
import RdbExportMonitorSaveProgressProcessor from './RdbExportMonitorSaveProgressProcessor';
import RdbExportCopyRDBToBucketProcessor from './RdbExportCopyRDBToBucketProcessor';
import RdbExportMonitorRDBMergeProcessor from './RdbExportMonitorRDBMergeProcessor';
import RdbExportRequestRDBMergeProcessor from './RdbExportRequestRDBMergeProcessor';
import PlaceholderProcessor from './PlaceholderProcessor';
import RdbImportDeleteLocalBackupProcessor from './RdbImportDeleteLocalBackupProcessor';
import RdbImportFlushInstanceProcessor from './RdbImportFlushInstanceProcessor';
import RdbImportMakeLocalBackupProcessor from './RdbImportMakeLocalBackupProcessor';
import RdbImportMonitorFormatValidationProcessor from './RdbImportMonitorFormatValidationProcessor';
import RdbImportMonitorImportRDBProcessor from './RdbImportMonitorImportRDBProcessor';
import RdbImportMonitorSaveProgressProcessor from './RdbImportMonitorSaveProgressProcessor';
import RdbImportMonitorSizeValidationProcessor from './RdbImportMonitorSizeValidationProcessor';
import RdbImportRdbFormatValidationProcessor from './RdbImportRdbFormatValidationProcessor';
import RdbImportRdbSizeValidationProcessor from './RdbImportRdbSizeValidationProcessor';
import RdbImportRecoverFailedImportProcessor from './RdbImportRecoverFailedImportProcessor';
import RdbImportRequestRdbImportProcessor from './RdbImportRequestRdbImportProcessor';
import RdbImportSendSaveCommandProcessor from './RdbImportSendSaveCommandProcessor';
import RdbImportValidateImportKeyNumberProcessor from './RdbImportValidateImportKeyNumberProcessor';

type IProcessorType = {
  name: string;
  processor: Processor;
  concurrency?: number;
  schema: TSchema;
}

export default [
  RdbExportRequestReadSignedURLProcessor,
  RdbExportSendSaveCommandProcessor,
  RdbExportMonitorSaveProgressProcessor,
  RdbExportCopyRDBToBucketProcessor,
  RdbExportMonitorRDBMergeProcessor,
  RdbExportRequestRDBMergeProcessor,
  PlaceholderProcessor,
  RdbImportDeleteLocalBackupProcessor,
  RdbImportFlushInstanceProcessor,
  RdbImportMakeLocalBackupProcessor,
  RdbImportMonitorFormatValidationProcessor,
  RdbImportMonitorImportRDBProcessor,
  RdbImportMonitorSaveProgressProcessor,
  RdbImportMonitorSizeValidationProcessor,
  RdbImportRdbFormatValidationProcessor,
  RdbImportRdbSizeValidationProcessor,
  RdbImportRecoverFailedImportProcessor,
  RdbImportRequestRdbImportProcessor,
  RdbImportSendSaveCommandProcessor,
  RdbImportValidateImportKeyNumberProcessor,
] as IProcessorType[];

function makeJobNode<T extends IProcessorType>(
  processor: T,
  data?: Static<T['schema']>,
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
  PlaceholderProcessor,
  RdbImportDeleteLocalBackupProcessor,
  RdbImportFlushInstanceProcessor,
  RdbImportMakeLocalBackupProcessor,
  RdbImportMonitorFormatValidationProcessor,
  RdbImportMonitorImportRDBProcessor,
  RdbImportMonitorSaveProgressProcessor,
  RdbImportMonitorSizeValidationProcessor,
  RdbImportRdbFormatValidationProcessor,
  RdbImportRdbSizeValidationProcessor,
  RdbImportRecoverFailedImportProcessor,
  RdbImportRequestRdbImportProcessor,
  RdbImportSendSaveCommandProcessor,
  RdbImportValidateImportKeyNumberProcessor,
}