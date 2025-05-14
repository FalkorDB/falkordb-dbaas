import { Processor } from "bullmq";
import { ITasksDBRepository } from "../repositories/tasks";
import { setupContainer } from "../container";
import { IBlobStorageRepository } from "../repositories/blob/IBlobStorageRepository";
import { Logger } from 'pino';
import { ExporterTaskNames, RdbExportRequestReadSignedURLProcessorData, RdbExportRequestReadSignedURLProcessorDataSchema } from "@falkordb/schemas/services/db-importer-worker/v1";
import { Value } from "@sinclair/typebox/value";

const processor: Processor<RdbExportRequestReadSignedURLProcessorData> = async (job, token) => {

  const container = setupContainer();
  const logger = container.resolve<Logger>('logger');

  job.log(`Processing 'rdb-export-request-read-signed-url' job ${job.id} with data: ${JSON.stringify(job.data, null, 2)}`);


  const tasksRepository = container.resolve<ITasksDBRepository>(ITasksDBRepository.name);
  const blobRepository = container.resolve<IBlobStorageRepository>(IBlobStorageRepository.name);

  try {
    Value.Assert(RdbExportRequestReadSignedURLProcessorDataSchema, job.data);

    const readUrl = await blobRepository.getReadUrl(
      job.data.bucketName,
      job.data.fileName,
      job.data.expiresIn
    )

    await tasksRepository.updateTask({
      taskId: job.data.taskId,
      status: 'completed',
      output: {
        readUrl,
      }
    })

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
  name: ExporterTaskNames.RdbExportRequestReadSignedURL,
  processor,
  concurrency: undefined,
  schema: RdbExportRequestReadSignedURLProcessorDataSchema,
}