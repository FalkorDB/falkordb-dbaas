import { DelayedError, Processor } from "bullmq";
import { setupContainer } from "../container";
import { ITasksDBRepository } from "../repositories/tasks";
import { K8sRepository } from "../repositories/k8s/K8sRepository";
import * as Yup from 'yup';
import { Logger } from 'pino';
import { Value } from "@sinclair/typebox/value";
import { ExporterTaskNames, RdbExportRequestRDBMergeProcessorData, RdbExportRequestRDBMergeProcessorDataSchema } from "@falkordb/schemas/services/db-importer-worker/v1";

const processor: Processor<RdbExportRequestRDBMergeProcessorData> = async (job, token) => {

  const container = setupContainer();
  const logger = container.resolve<Logger>('logger');

  job.log(`Processing 'rdb-export-request-rdb-merge' job ${job.id} with data: ${JSON.stringify(job.data, null, 2)}`);

  Value.Assert(RdbExportRequestRDBMergeProcessorDataSchema, job.data);

  const tasksRepository = container.resolve<ITasksDBRepository>(ITasksDBRepository.name);
  const k8sRepository = container.resolve<K8sRepository>(K8sRepository.name);

  try {

    await k8sRepository.createMergeRDBsJob(
      job.data.projectId,
      job.data.cloudProvider,
      job.data.clusterId,
      job.data.region,
      job.data.namespace,
      job.data.taskId,
      job.data.bucketName,
      job.data.rdbFileNames,
      job.data.outputRdbFileName,
    )

    return {
      success: true,
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
  name: ExporterTaskNames.RdbExportRequestRDBMerge,
  processor,
  concurrency: undefined,
  schema: RdbExportRequestRDBMergeProcessorDataSchema,
}