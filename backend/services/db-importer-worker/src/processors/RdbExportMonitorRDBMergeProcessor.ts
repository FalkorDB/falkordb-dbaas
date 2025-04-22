import { DelayedError, Processor } from "bullmq";
import { setupContainer } from "../container";
import { ITasksDBRepository } from "../repositories/tasks";
import { K8sRepository } from "../repositories/k8s/K8sRepository";
import { Logger } from 'pino';
import { RdbExportMonitorRDBMergeProcessorDataSchema, RdbExportMonitorRDBMergeProcessorData, ExporterTaskNames } from '@falkordb/schemas/src/services/db-importer-worker/v1'
import { Value } from '@sinclair/typebox/value'

const processor: Processor<RdbExportMonitorRDBMergeProcessorData> = async (job, token) => {

  const container = setupContainer();
  const logger = container.resolve<Logger>('logger');

  job.log(`Processing 'rdb-export-monitor-rdb-merge' job ${job.id} with data: ${JSON.stringify(job.data, null, 2)}`);

  Value.Assert(RdbExportMonitorRDBMergeProcessorDataSchema, job.data);

  const tasksRepository = container.resolve<ITasksDBRepository>(ITasksDBRepository.name);
  const k8sRepository = container.resolve<K8sRepository>(K8sRepository.name);

  try {

    const jobStatus = await k8sRepository.getJobStatus(
      job.data.projectId,
      job.data.cloudProvider,
      job.data.clusterId,
      job.data.region,
      job.data.namespace,
      job.data.taskId
    )

    if (jobStatus === 'failed') {
      throw new Error(`K8s Job ${job.data.taskId} failed`);
    }

    if (jobStatus === 'pending') {
      await job.moveToDelayed(Date.now() + 5000, token);
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
  name: ExporterTaskNames.RdbExportMonitorRDBMerge,
  processor,
  concurrency: undefined,
  schema: RdbExportMonitorRDBMergeProcessorDataSchema,
}