import { DelayedError, Processor } from 'bullmq';
import { setupContainer } from "../container";
import { ITasksDBRepository } from "../repositories/tasks";
import { K8sRepository } from "../repositories/k8s/K8sRepository";
import { Logger } from 'pino';
import { RdbImportTaskNames, RdbImportMonitorSizeValidationProgressProcessorDataSchema, RdbImportMonitorSizeValidationProgressProcessorData } from "@falkordb/schemas/services/db-importer-worker/v1";
import { Value } from "@sinclair/typebox/value";
import { IBlobStorageRepository } from '../repositories/blob/IBlobStorageRepository';
import { parse } from 'path';

const processor: Processor<RdbImportMonitorSizeValidationProgressProcessorData> = async (job, token) => {

  const container = setupContainer();
  const logger = container.resolve<Logger>('logger');

  job.log(`Processing 'rdb-import-monitor-size-validation-progress' job ${job.id} with data: ${JSON.stringify(job.data, null, 2)}`);

  const tasksRepository = container.resolve<ITasksDBRepository>(ITasksDBRepository.name);
  const k8sRepository = container.resolve<K8sRepository>(K8sRepository.name);
  const blobStorageRepository = container.resolve<IBlobStorageRepository>(IBlobStorageRepository.name);

  try {
    Value.Assert(RdbImportMonitorSizeValidationProgressProcessorDataSchema, job.data);

    const jobStatus = await k8sRepository.getJobStatus(
      job.data.projectId,
      job.data.cloudProvider,
      job.data.clusterId,
      job.data.region,
      job.data.namespace,
      `${job.data.taskId}-size-validation`
    );

    if (jobStatus === 'failed') {
      throw new Error(`K8s Job ${job.data.taskId} failed`);
    }

    if (jobStatus === 'pending') {
      await job.moveToDelayed(Date.now() + 5000, token);
      throw new DelayedError();
    }

    const rdbSize = await blobStorageRepository.readFileContent(
      job.data.bucketName,
      job.data.jobResultFileName
    );

    if (isNaN(parseInt(rdbSize))) {
      throw new Error(`Invalid RDB size: ${rdbSize}`);
    }

    if ((parseInt(rdbSize) / 1024 / 1024) > job.data.maxRdbSize) {
      throw new Error(`RDB size ${rdbSize} exceeds maximum allowed size ${job.data.maxRdbSize}`);
    }

  } catch (error) {
    if (error instanceof DelayedError) {
      throw error;
    }
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
  name: RdbImportTaskNames.RdbImportMonitorSizeValidationProgress,
  processor,
  concurrency: undefined,
  schema: RdbImportMonitorSizeValidationProgressProcessorDataSchema,
}