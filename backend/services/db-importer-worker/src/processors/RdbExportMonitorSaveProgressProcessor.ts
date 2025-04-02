import { DelayedError, Processor } from "bullmq";
import { setupContainer } from "../container";
import { ITasksDBRepository } from "../repositories/tasks";
import { K8sRepository } from "../repositories/k8s/K8sRepository";

const processor: Processor = async (job, token) => {

  const container = setupContainer();
  const logger = container.resolve('logger');

  logger.info(job.data, `Processing 'rdb-export-send-save-command' job ${job.id} with data:`);

  const tasksRepository = container.resolve<ITasksDBRepository>(ITasksDBRepository.name);
  const k8sRepository = container.resolve<K8sRepository>(K8sRepository.name);

  try {

    const task = await tasksRepository.getTaskById(job.data.taskId);

    if (!task) {
      throw new Error(`Task with ID ${job.data.taskId} not found`);
    }

    const isSaving = await k8sRepository.isSaving(
      task.payload.source.cloudProvider,
      task.payload.source.clusterId,
      task.payload.source.region,
      task.payload.source.instanceId,
      task.payload.source.podId,
      task.payload.source.hasTLS,
    )

    if (isSaving) {
      await job.moveToDelayed(Date.now() + 1000, token);
      throw new DelayedError();
    } else {
      return {
        success: true,
      }
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
  name: 'rdb-export-monitor-save-progress',
  processor,
  concurrency: undefined,
}