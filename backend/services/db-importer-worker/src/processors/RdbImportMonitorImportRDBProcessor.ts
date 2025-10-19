import { DelayedError, Processor, Queue } from "bullmq";
import { setupContainer } from "../container";
import { ITasksDBRepository } from "../repositories/tasks";
import { K8sRepository } from "../repositories/k8s/K8sRepository";
import { Logger } from 'pino';
import { RdbImportMonitorImportRDBProcessorDataSchema, RdbImportMonitorImportRDBProcessorData, RdbImportTaskNames } from '@falkordb/schemas/services/db-importer-worker/v1'
import { Value } from '@sinclair/typebox/value'
import RdbImportRecoverFailedImportProcessor from "./RdbImportRecoverFailedImportProcessor";
import { Static } from "@sinclair/typebox";

const processor: Processor<RdbImportMonitorImportRDBProcessorData> = async (job, token) => {

  const container = setupContainer();
  const logger = container.resolve<Logger>('logger');

  logger.debug(`Processing 'rdb-import-monitor-import-rdb' job ${job.id} with data: ${JSON.stringify(job.data, null, 2)}`);


  const tasksRepository = container.resolve<ITasksDBRepository>(ITasksDBRepository.name);
  const k8sRepository = container.resolve<K8sRepository>(K8sRepository.name);

  try {
    Value.Assert(RdbImportMonitorImportRDBProcessorDataSchema, job.data);

    const [jobStatus] = await k8sRepository.getJobStatus(
      job.data.projectId,
      job.data.cloudProvider,
      job.data.clusterId,
      job.data.region,
      job.data.namespace,
      `${job.data.taskId}-import-rdb`
    )

    if (jobStatus === 'failed') {
      const queue = new Queue(RdbImportRecoverFailedImportProcessor.name, {
        connection: {
          url: process.env.REDIS_URL,
        }
      })
      await queue.add(RdbImportRecoverFailedImportProcessor.name, {
        taskId: job.data.taskId,
        cloudProvider: job.data.cloudProvider,
        clusterId: job.data.clusterId,
        region: job.data.region,
        instanceId: job.data.namespace,
        podIds: job.data.podIds,
        aofEnabled: job.data.aofEnabled,
        backupPath: job.data.backupPath,
      } as Static<typeof RdbImportRecoverFailedImportProcessor.schema>);
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
      errors: [error.message ?? error.toString()],
      status: 'failed',
    });
    throw error;
  }
}

export default {
  name: RdbImportTaskNames.RdbImportMonitorImportRDB,
  processor,
  concurrency: undefined,
  schema: RdbImportMonitorImportRDBProcessorDataSchema,
}