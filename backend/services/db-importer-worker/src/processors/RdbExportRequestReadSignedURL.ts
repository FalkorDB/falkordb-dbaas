import { Processor } from "bullmq";
import { ITasksDBRepository } from "../repositories/tasks";
import { setupContainer } from "../container";
import { IBlobStorageRepository } from "../repositories/blob/IBlobStorageRepository";
import * as Yup from 'yup';
import { Logger } from 'pino';

const schema = Yup.object().shape({
  taskId: Yup.string().required(),
  bucketName: Yup.string().required(),
  fileName: Yup.string().required(),
  expiresIn: Yup.number().required(),
});
export type RdbExportRequestReadSignedURLJobData = Yup.InferType<typeof schema>;

const processor: Processor<RdbExportRequestReadSignedURLJobData> = async (job, token) => {

  const container = setupContainer();
  const logger = container.resolve<Logger>('logger');

  job.log(`Processing 'rdb-export-request-read-signed-url' job ${job.id} with data: ${JSON.stringify(job.data, null, 2)}`);

  schema.validateSync(job.data);

  const tasksRepository = container.resolve<ITasksDBRepository>(ITasksDBRepository.name);
  const blobRepository = container.resolve<IBlobStorageRepository>(IBlobStorageRepository.name);

  try {

    const readUrl = await blobRepository.getReadUrl(
      job.data.bucketName,
      job.data.fileName,
      job.data.expiresIn
    )

    await tasksRepository.updateTask({
      taskId: job.data.taskId,
      output: {
        readUrls: [readUrl],
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
  name: 'rdb-export-request-read-signed-url',
  processor,
  concurrency: undefined,
  schema,
}