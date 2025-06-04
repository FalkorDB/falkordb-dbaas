import { Processor } from 'bullmq';
import { setupContainer } from "../container";
import { ITasksDBRepository } from "../repositories/tasks";
import { K8sRepository } from "../repositories/k8s/K8sRepository";
import { Logger } from 'pino';
import { RdbImportTaskNames, RdbImportFlushInstanceProcessorData, RdbImportFlushInstanceProcessorDataSchema } from "@falkordb/schemas/services/db-importer-worker/v1";
import { Value } from "@sinclair/typebox/value";

const processor: Processor<RdbImportFlushInstanceProcessorData> = async (job, token) => {

  const container = setupContainer();
  const logger = container.resolve<Logger>('logger');

  logger.debug(`Processing 'rdb-import-flush-instance' job ${job.id} with data: ${JSON.stringify(job.data, null, 2)}`);

  const tasksRepository = container.resolve<ITasksDBRepository>(ITasksDBRepository.name);
  const k8sRepository = container.resolve<K8sRepository>(K8sRepository.name);

  try {
    Value.Assert(RdbImportFlushInstanceProcessorDataSchema, job.data);

    await k8sRepository.flushInstance(
      job.data.cloudProvider,
      job.data.clusterId,
      job.data.region,
      job.data.instanceId,
      job.data.podId,
      job.data.hasTLS,
      job.data.isCluster,
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
  name: RdbImportTaskNames.RdbImportFlushInstance,
  processor,
  concurrency: undefined,
  schema: RdbImportFlushInstanceProcessorDataSchema,
}