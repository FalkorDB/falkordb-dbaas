import { DelayedError, Processor } from 'bullmq';
import { setupContainer } from "../container";
import { ITasksDBRepository } from "../repositories/tasks";
import { K8sRepository } from "../repositories/k8s/K8sRepository";
import { Logger } from 'pino';
import { RdbImportTaskNames, RdbImportMonitorFormatValidationProgressProcessorDataSchema, RdbImportMonitorFormatValidationProgressProcessorData } from "@falkordb/schemas/services/db-importer-worker/v1";
import { Value } from "@sinclair/typebox/value";
import { IBlobStorageRepository } from '../repositories/blob/IBlobStorageRepository';

const processor: Processor<RdbImportMonitorFormatValidationProgressProcessorData> = async (job, token) => {

  const container = setupContainer();
  const logger = container.resolve<Logger>('logger');

  logger.debug(`Processing 'rdb-import-monitor-format-validation-progress' job ${job.id} with data: ${JSON.stringify(job.data, null, 2)}`);

  const tasksRepository = container.resolve<ITasksDBRepository>(ITasksDBRepository.name);
  const k8sRepository = container.resolve<K8sRepository>(K8sRepository.name);
  const blobStorageRepository = container.resolve<IBlobStorageRepository>(IBlobStorageRepository.name);

  try {
    Value.Assert(RdbImportMonitorFormatValidationProgressProcessorDataSchema, job.data);

    const [jobStatus, logs] = await k8sRepository.getJobStatus(
      job.data.projectId,
      job.data.cloudProvider,
      job.data.clusterId,
      job.data.region,
      job.data.namespace,
      `${job.data.taskId}-format-validation`,
    );

    if (jobStatus === 'failed') {
      if (logs.includes("can't read MAGIC STRING [REDIS]")) {
        throw new Error("Invalid RDB file format");
      }
      throw new Error(`K8s Job ${job.data.taskId} failed`);
    }

    if (jobStatus === 'pending') {
      await job.moveToDelayed(Date.now() + 5000, token);
      throw new DelayedError();
    }

    const keyNumber = await blobStorageRepository.readFileContent(
      job.data.bucketName,
      job.data.jobResultFileName
    );

    if (isNaN(parseInt(keyNumber))) {
      throw new Error(`Invalid key number: ${keyNumber}`);
    }

    await tasksRepository.updateTask({
      taskId: job.data.taskId,
      output: {
        numberOfKeys: parseInt(keyNumber),
      }
    });

  } catch (error) {
    if (error instanceof DelayedError) {
      throw error;
    }
    logger.error(error, `Error processing job ${job.id}: ${error}`);
    await tasksRepository.updateTask({
      taskId: job.data.taskId,
      errors: [error.message ?? error.toString()],
      status: 'failed',
    });
    throw error;
  }
}

export default {
  name: RdbImportTaskNames.RdbImportMonitorFormatValidationProgress,
  processor,
  concurrency: undefined,
  schema: RdbImportMonitorFormatValidationProgressProcessorDataSchema,
}