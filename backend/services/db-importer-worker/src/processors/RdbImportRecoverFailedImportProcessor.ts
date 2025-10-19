import { Processor } from 'bullmq';
import { setupContainer } from "../container";
import { ITasksDBRepository } from "../repositories/tasks";
import { K8sRepository } from "../repositories/k8s/K8sRepository";
import { Logger } from 'pino';
import { RdbImportTaskNames, RdbImportRecoverFailedImportProcessorData, RdbImportRecoverFailedImportProcessorDataSchema } from "@falkordb/schemas/services/db-importer-worker/v1";
import { Value } from "@sinclair/typebox/value";

const processor: Processor<RdbImportRecoverFailedImportProcessorData> = async (job, token) => {

  const container = setupContainer();
  const logger = container.resolve<Logger>('logger');

  logger.debug(`Processing 'rdb-import-recover-failed-import' job ${job.id} with data: ${JSON.stringify(job.data, null, 2)}`);

  const tasksRepository = container.resolve<ITasksDBRepository>(ITasksDBRepository.name);
  const k8sRepository = container.resolve<K8sRepository>(K8sRepository.name);

  try {
    Value.Assert(RdbImportRecoverFailedImportProcessorDataSchema, job.data);

    await k8sRepository.restoreLocalBackup(
      job.data.cloudProvider,
      job.data.clusterId,
      job.data.region,
      job.data.instanceId,
      job.data.podIds,
      job.data.aofEnabled,
      job.data.backupPath,
    );

    await k8sRepository.deletePods(
      job.data.cloudProvider,
      job.data.clusterId,
      job.data.region,
      job.data.instanceId,
      job.data.podIds,
    );

  } catch (error) {
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
  name: RdbImportTaskNames.RdbImportRecoverFailedImport,
  processor,
  concurrency: undefined,
  schema: RdbImportRecoverFailedImportProcessorDataSchema,
}