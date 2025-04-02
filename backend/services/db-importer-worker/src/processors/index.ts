import RdbExportRequestSignedURLProcessor from './RdbExportRequestSignedURL';
import RdbExportSendSaveCommandProcessor from './RdbExportSendSaveCommandProcessor';
import RdbExportMonitorSaveProgressProcessor from './RdbExportMonitorSaveProgressProcessor';
import RdbExportCopyRDBToBucketProcessor from './RdbExportCopyRDBToBucketProcessor';
import { Processor } from 'bullmq';

export default [
  RdbExportRequestSignedURLProcessor,
  RdbExportSendSaveCommandProcessor,
  RdbExportMonitorSaveProgressProcessor,
  RdbExportCopyRDBToBucketProcessor,
] as {
  name: string;
  processor: Processor;
  concurrency: number | undefined;
}[];