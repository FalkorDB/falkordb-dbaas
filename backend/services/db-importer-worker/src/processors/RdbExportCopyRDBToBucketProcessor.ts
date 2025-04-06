import { Processor } from "bullmq";
import { setupContainer } from "../container";
import { ITasksDBRepository } from "../repositories/tasks";
import { K8sRepository } from "../repositories/k8s/K8sRepository";

const processor: Processor = async (job, token) => {
  const container = setupContainer();

  job.log(`Processing 'rdb-export-copy-rdb-to-bucket' job ${job.id} with data: ${JSON.stringify(job.data, null, 2)}`);

  const tasksRepository = container.resolve<ITasksDBRepository>(ITasksDBRepository.name);
  const k8sRepository = container.resolve<K8sRepository>(K8sRepository.name);

  try {

    const task = await tasksRepository.getTaskById(job.data.taskId);

    if (!task) {
      throw new Error(`Task with ID ${job.data.taskId} not found`);
    }

    await k8sRepository.sendUploadCommand(
      task.payload.source.cloudProvider,
      task.payload.source.clusterId,
      task.payload.source.region,
      task.payload.source.instanceId,
      task.payload.source.podId,
      task.output.writeUrl,
    )

    await tasksRepository.updateTask({
      taskId: job.data.taskId,
      status: 'completed',
    });

    job.log(`Task ${job.data.taskId} completed successfully`);

    return {
      success: true,
    }
  } catch (error) {
    job.log(`Error processing job ${job.id}: ${error}`);
    await tasksRepository.updateTask({
      taskId: job.data.taskId,
      error: error.message ?? error.toString(),
      status: 'failed',
    });
    throw error;
  }
}

export default {
  name: 'rdb-export-copy-rdb-to-bucket',
  processor,
}