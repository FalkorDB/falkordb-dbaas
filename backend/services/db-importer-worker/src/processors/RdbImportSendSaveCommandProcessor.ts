import { Processor } from "bullmq";
import { setupContainer } from "../container";
import { ITasksDBRepository } from "../repositories/tasks";
import { K8sRepository } from "../repositories/k8s/K8sRepository";
import { Logger } from 'pino';
import { RdbImportTaskNames, RdbImportSendSaveCommandProcessorData, RdbImportSendSaveCommandProcessorDataSchema } from "@falkordb/schemas/services/db-importer-worker/v1";
import { Value } from "@sinclair/typebox/value";

const processor: Processor<RdbImportSendSaveCommandProcessorData> = async (job, token) => {

  const container = setupContainer();
  const logger = container.resolve<Logger>('logger');

  job.log(`Processing 'rdb-import-send-save-command' job ${job.id} with data: ${JSON.stringify(job.data, null, 2)}`);


  const tasksRepository = container.resolve<ITasksDBRepository>(ITasksDBRepository.name);
  const k8sRepository = container.resolve<K8sRepository>(K8sRepository.name);

  try {
    Value.Assert(RdbImportSendSaveCommandProcessorDataSchema, job.data);

    if (job.data.aofEnabled) {
      for (const podId of job.data.podIds) {
        await k8sRepository.sendSaveCommand(
          job.data.cloudProvider,
          job.data.clusterId,
          job.data.region,
          job.data.instanceId,
          podId,
          job.data.hasTLS,
        );
      }
    } else {
      for (const podId of job.data.podIds) {
        await k8sRepository.sendRewriteAofCommand(
          job.data.cloudProvider,
          job.data.clusterId,
          job.data.region,
          job.data.instanceId,
          podId,
          job.data.hasTLS,
        )
      }
    }
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
  name: RdbImportTaskNames.RdbImportSendSaveCommand,
  processor,
  concurrency: undefined,
  schema: RdbImportSendSaveCommandProcessorDataSchema,
}