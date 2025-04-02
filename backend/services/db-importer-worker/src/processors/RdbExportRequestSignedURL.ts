import { Processor } from "bullmq";
import { ITasksDBRepository } from "../repositories/tasks";
import { setupContainer } from "../container";
import { IBlobStorageRepository } from "../repositories/blob/IBlobStorageRepository";

const processor: Processor = async (job, token) => {

  const container = setupContainer();
  const logger = container.resolve('logger');

  logger.info(job.data, `Processing 'rdb-export-request-signed-url' job ${job.id} with data:`);

  const tasksRepository = container.resolve<ITasksDBRepository>(ITasksDBRepository.name);
  const blobRepository = container.resolve<IBlobStorageRepository>(IBlobStorageRepository.name);

  try {

    const task = await tasksRepository.getTaskById(job.data.taskId);

    if (!task) {
      throw new Error(`Task with ID ${job.data.taskId} not found`);
    }

    const [
      readUrl,
      writeUrl
    ] = await Promise.all([
      blobRepository.getReadUrl(
        task.payload.destination.bucketName,
        task.payload.destination.fileName,
        task.payload.destination.expiresIn
      ),
      blobRepository.getWriteUrl(
        task.payload.destination.bucketName,
        task.payload.destination.fileName,
        'application/octet-stream',
        task.payload.destination.expiresIn
      )
    ])

    task.output = {
      readUrl,
      writeUrl,
    }

    await tasksRepository.updateTask(task)

    return {
      success: true,
    }

  } catch (error) {

    logger.error(`Error processing job ${job.id}: ${error}`);
    await tasksRepository.updateTask({
      taskId: job.data.taskId,
      error: error.message ?? error.toString(),
      status: 'failed',
    });
    throw error;
  }
}

export default {
  name: 'rdb-export-request-signed-url',
  processor,
  concurrency: undefined,
}