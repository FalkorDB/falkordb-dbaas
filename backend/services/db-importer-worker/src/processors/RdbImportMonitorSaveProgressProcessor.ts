import { DelayedError, Processor } from "bullmq";
import { setupContainer } from "../container";
import { ITasksDBRepository } from "../repositories/tasks";
import { K8sRepository } from "../repositories/k8s/K8sRepository";
import { Logger } from 'pino';
import { RdbImportMonitorSaveProgressProcessorDataSchema, RdbImportMonitorSaveProgressProcessorData, RdbImportTaskNames } from "@falkordb/schemas/services/db-importer-worker/v1";
import { Value } from "@sinclair/typebox/value";

const processor: Processor<RdbImportMonitorSaveProgressProcessorData> = async (job, token) => {

  const container = setupContainer();
  const logger = container.resolve<Logger>('logger');

  job.log(`Processing 'rdb-import-monitor-rewrite-aof-progress' job ${job.id} with data: ${JSON.stringify(job.data, null, 2)}`);


  const tasksRepository = container.resolve<ITasksDBRepository>(ITasksDBRepository.name);
  const k8sRepository = container.resolve<K8sRepository>(K8sRepository.name);

  try {
    Value.Assert(RdbImportMonitorSaveProgressProcessorDataSchema, job.data);

    let pending = true;
    if (job.data.aofEnabled) {
      pending = await Promise.all(
        job.data.podIds.map((podId) =>
          k8sRepository.isRewritingAof(
            job.data.cloudProvider,
            job.data.clusterId,
            job.data.region,
            job.data.instanceId,
            podId,
            job.data.hasTLS,
          )
        )).then(results => results.some(result => result));
    } else {
      pending = await Promise.all(
        job.data.podIds.map((podId) =>
          k8sRepository.isSaving(
            job.data.cloudProvider,
            job.data.clusterId,
            job.data.region,
            job.data.instanceId,
            podId,
            job.data.hasTLS,
          )
        )).then(results => results.some(result => result));
    }

    if (pending) {
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
  name: RdbImportTaskNames.RdbImportMonitorSaveProgress,
  processor,
  concurrency: undefined,
  schema: RdbImportMonitorSaveProgressProcessorDataSchema,
}