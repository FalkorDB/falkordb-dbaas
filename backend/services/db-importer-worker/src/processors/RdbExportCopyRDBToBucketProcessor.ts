import { Processor } from "bullmq";
import { setupContainer } from "../container";
import { ITasksDBRepository } from "../repositories/tasks";
import { K8sRepository } from "../repositories/k8s/K8sRepository";
import { IBlobStorageRepository } from "../repositories/blob/IBlobStorageRepository";
import { Logger } from 'pino';
import { RdbExportCopyRDBToBucketProcessorDataSchema, RdbExportCopyRDBToBucketProcessorData, ExporterTaskNames } from '@falkordb/schemas/services/db-importer-worker/v1'
import { Value } from '@sinclair/typebox/value'


const processor: Processor<RdbExportCopyRDBToBucketProcessorData> = async (job, token) => {
  const container = setupContainer();
  const logger = container.resolve<Logger>('logger');

  job.log(`Processing 'rdb-export-copy-rdb-to-bucket' job ${job.id} with data: ${JSON.stringify(job.data, null, 2)}`);
  
  
  const tasksRepository = container.resolve<ITasksDBRepository>(ITasksDBRepository.name);
  const k8sRepository = container.resolve<K8sRepository>(K8sRepository.name);
  const blobRepository = container.resolve<IBlobStorageRepository>(IBlobStorageRepository.name);
  
  try {
    Value.Assert(RdbExportCopyRDBToBucketProcessorDataSchema, job.data);
    

    const writeUrl = await blobRepository.getWriteUrl(
      job.data.bucketName,
      job.data.fileName,
      'application/octet-stream',
      60 * 60 * 1000 // 1 hour
    )

    await k8sRepository.sendUploadCommand(
      job.data.cloudProvider,
      job.data.clusterId,
      job.data.region,
      job.data.instanceId,
      job.data.podId,
      writeUrl,
    )

    return {
      success: true,
    }
  } catch (error) {
    logger.error(error, `Error processing job ${job.id}: ${error}`);
    await tasksRepository.updateTask({
      taskId: job.data.taskId,
      error: error.message ?? error.toString(),
      status: 'failed',
    });
    throw error;
  }
}

export default {
  name: ExporterTaskNames.RdbExportCopyRdbToBucket,
  processor,
  schema: RdbExportCopyRDBToBucketProcessorDataSchema,
}