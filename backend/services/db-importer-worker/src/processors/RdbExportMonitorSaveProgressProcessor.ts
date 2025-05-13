import { DelayedError, Processor } from "bullmq";
import { setupContainer } from "../container";
import { ITasksDBRepository } from "../repositories/tasks";
import { K8sRepository } from "../repositories/k8s/K8sRepository";
import { Logger } from 'pino';
import { RdbExportMonitorSaveProgressProcessorDataSchema, RdbExportMonitorSaveProgressProcessorData, ExporterTaskNames } from "@falkordb/schemas/services/db-importer-worker/v1";
import { Value } from "@sinclair/typebox/value";

const processor: Processor<RdbExportMonitorSaveProgressProcessorData> = async (job, token) => {

  const container = setupContainer();
  const logger = container.resolve<Logger>('logger');

  job.log(`Processing 'rdb-export-monitor-save-progress' job ${job.id} with data: ${JSON.stringify(job.data, null, 2)}`);

  Value.Assert(RdbExportMonitorSaveProgressProcessorDataSchema, job.data);

  const tasksRepository = container.resolve<ITasksDBRepository>(ITasksDBRepository.name);
  const k8sRepository = container.resolve<K8sRepository>(K8sRepository.name);

  try {

    const isSaving = await k8sRepository.isSaving(
      job.data.cloudProvider,
      job.data.clusterId,
      job.data.region,
      job.data.instanceId,
      job.data.podId,
      job.data.hasTLS,
    )

    if (isSaving) {
      await job.moveToDelayed(Date.now() + 1000, token);
      throw new DelayedError();
    } else {
      return {
        success: true,
      }
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
  name: ExporterTaskNames.RdbExportMonitorSaveProgress,
  processor,
  concurrency: undefined,
  schema: RdbExportMonitorSaveProgressProcessorDataSchema,
}