import { Processor } from "bullmq";
import { setupContainer } from "../container";
import { ITasksDBRepository } from "../repositories/tasks";
import { K8sRepository } from "../repositories/k8s/K8sRepository";
import { Logger } from 'pino';
import { Value } from "@sinclair/typebox/value";
import { RdbImportTaskNames, RdbImportRequestRDBImportProcessorData, RdbImportRequestRDBImportProcessorDataSchema } from "@falkordb/schemas/services/db-importer-worker/v1";
import { IBlobStorageRepository } from "../repositories/blob/IBlobStorageRepository";

const processor: Processor<RdbImportRequestRDBImportProcessorData> = async (job, token) => {

  const container = setupContainer();
  const logger = container.resolve<Logger>('logger');

  job.log(`Processing 'rdb-import-request-rdb-import' job ${job.id} with data: ${JSON.stringify(job.data, null, 2)}`);


  const tasksRepository = container.resolve<ITasksDBRepository>(ITasksDBRepository.name);
  const k8sRepository = container.resolve<K8sRepository>(K8sRepository.name);
  const blobStorageRepository = container.resolve<IBlobStorageRepository>(IBlobStorageRepository.name);

  try {
    Value.Assert(RdbImportRequestRDBImportProcessorDataSchema, job.data);

    const readUrl = await blobStorageRepository.getReadUrl(
      job.data.bucketName,
      job.data.fileName,
    );

    await k8sRepository.createImportRDBJob(
      job.data.projectId,
      job.data.cloudProvider,
      job.data.clusterId,
      job.data.region,
      job.data.instanceId,
      `${job.data.taskId}-import-rdb`,
      job.data.podId,
      job.data.hasTLS,
      readUrl
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
  name: RdbImportTaskNames.RdbImportRequestRDBImport,
  processor,
  concurrency: undefined,
  schema: RdbImportRequestRDBImportProcessorDataSchema,
}