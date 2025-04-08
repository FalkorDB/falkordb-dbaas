import { DelayedError, Processor } from "bullmq";
import { setupContainer } from "../container";
import { ITasksDBRepository } from "../repositories/tasks";
import { K8sRepository } from "../repositories/k8s/K8sRepository";
import * as Yup from 'yup';
import { Logger } from 'pino';

const schema = Yup.object().shape({
  taskId: Yup.string().required(),
  cloudProvider: Yup.string().oneOf(['gcp', 'aws']).required(),
  clusterId: Yup.string().required(),
  region: Yup.string().required(),
  instanceId: Yup.string().required(),
  podId: Yup.string().required(),
  hasTLS: Yup.boolean().required(),
});
export type RdbExportMonitorSaveProgressJobData = Yup.InferType<typeof schema>;

const processor: Processor<RdbExportMonitorSaveProgressJobData> = async (job, token) => {

  const container = setupContainer();
    const logger = container.resolve<Logger>('logger');

  job.log(`Processing 'rdb-export-monitor-save-progress' job ${job.id} with data: ${JSON.stringify(job.data, null, 2)}`);

  schema.validateSync(job.data);

  const tasksRepository = container.resolve<ITasksDBRepository>(ITasksDBRepository.name);
  const k8sRepository = container.resolve<K8sRepository>(K8sRepository.name);

  try {

    const isSaving = await k8sRepository.isSaving(
      job.data.cloudProvider,
      job.data.clusterId,
      job.data.region,
      job.data.instanceId,
      job.data.podId,
      job.data.hasTLS,
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
  name: 'rdb-export-monitor-save-progress',
  processor,
  concurrency: undefined,
  schema,
}