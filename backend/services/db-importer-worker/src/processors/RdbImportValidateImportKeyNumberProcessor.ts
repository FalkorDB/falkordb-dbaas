import { Processor } from 'bullmq';
import { setupContainer } from "../container";
import { ITasksDBRepository } from "../repositories/tasks";
import { K8sRepository } from "../repositories/k8s/K8sRepository";
import { Logger } from 'pino';
import { RdbImportTaskNames, RdbImportValidateImportKeyNumberProcessorData, RdbImportValidateImportKeyNumberProcessorDataSchema } from "@falkordb/schemas/services/db-importer-worker/v1";
import { Value } from "@sinclair/typebox/value";
import { Queue } from 'bullmq';
import RdbImportDeleteLocalBackupProcessor from './RdbImportDeleteLocalBackupProcessor'
import RdbImportRecoverFailedImportProcessor from './RdbImportRecoverFailedImportProcessor'
import { Static } from '@sinclair/typebox';
import { RDBImportOutputType, RDBTaskType } from '../schemas/rdb-task';

const processor: Processor<RdbImportValidateImportKeyNumberProcessorData> = async (job, token) => {

  const container = setupContainer();
  const logger = container.resolve<Logger>('logger');

  logger.debug(`Processing 'rdb-import-validate-import-key-number' job ${job.id} with data: ${JSON.stringify(job.data, null, 2)}`);

  const tasksRepository = container.resolve<ITasksDBRepository>(ITasksDBRepository.name);
  const k8sRepository = container.resolve<K8sRepository>(K8sRepository.name);

  try {
    Value.Assert(RdbImportValidateImportKeyNumberProcessorDataSchema, job.data);

    const task = await tasksRepository.getTaskById(job.data.taskId) as RDBTaskType;

    const keyCount = await k8sRepository.getKeyCountFromAllPods(
      job.data.cloudProvider,
      job.data.clusterId,
      job.data.region,
      job.data.instanceId,
      job.data.podIds[0],
      job.data.hasTLS,
      job.data.isCluster,
    );

    if (keyCount !== (task.output as RDBImportOutputType).numberOfKeys) {
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
        instanceId: job.data.instanceId,
        podIds: job.data.podIds,
        aofEnabled: job.data.aofEnabled,
        backupPath: job.data.backupPath,
      } as Static<typeof RdbImportRecoverFailedImportProcessor.schema>);
      throw new Error(`Key count mismatch: expected ${(task.output as RDBImportOutputType).numberOfKeys}, got ${keyCount}`);
    }

    const queue = new Queue(RdbImportDeleteLocalBackupProcessor.name, {
      connection: {
        url: process.env.REDIS_URL,
      }
    })

    for (const podId of job.data.podIds) {
      await queue.add(RdbImportDeleteLocalBackupProcessor.name, {
        taskId: job.data.taskId,
        cloudProvider: job.data.cloudProvider,
        clusterId: job.data.clusterId,
        region: job.data.region,
        instanceId: job.data.instanceId,
        podId: podId,
        backupPath: job.data.backupPath,
      } as Static<typeof RdbImportDeleteLocalBackupProcessor.schema>)
    }

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
  name: RdbImportTaskNames.RdbImportValidateImportKeyNumber,
  processor,
  concurrency: undefined,
  schema: RdbImportValidateImportKeyNumberProcessorDataSchema,
}