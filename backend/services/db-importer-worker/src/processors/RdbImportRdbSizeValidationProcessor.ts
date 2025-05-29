import { Processor } from 'bullmq';
import { setupContainer } from "../container";
import { ITasksDBRepository } from "../repositories/tasks";
import { K8sRepository } from "../repositories/k8s/K8sRepository";
import { Logger } from 'pino';
import { RdbImportTaskNames, RdbImportValidateRDBSizeProcessorData, RdbImportValidateRDBSizeProcessorDataSchema } from "@falkordb/schemas/services/db-importer-worker/v1";
import { Value } from "@sinclair/typebox/value";

const processor: Processor<RdbImportValidateRDBSizeProcessorData> = async (job, token) => {

  const container = setupContainer();
  const logger = container.resolve<Logger>('logger');

  job.log(`Processing 'rdb-import-rdb-size-validation' job ${job.id} with data: ${JSON.stringify(job.data, null, 2)}`);

  const tasksRepository = container.resolve<ITasksDBRepository>(ITasksDBRepository.name);
  const k8sRepository = container.resolve<K8sRepository>(K8sRepository.name);

  try {
    Value.Assert(RdbImportValidateRDBSizeProcessorDataSchema, job.data);

    await k8sRepository.createValidateRdbSizeJob(
      job.data.projectId,
      job.data.cloudProvider,
      job.data.clusterId,
      job.data.region,
      job.data.namespace,
      `${job.data.taskId}-size-validation`,
      job.data.bucketName,
      job.data.fileName,
      job.data.jobResultFileName,
    );

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
  name: RdbImportTaskNames.RdbImportValidateRDBSize,
  processor,
  concurrency: undefined,
  schema: RdbImportValidateRDBSizeProcessorDataSchema,
}