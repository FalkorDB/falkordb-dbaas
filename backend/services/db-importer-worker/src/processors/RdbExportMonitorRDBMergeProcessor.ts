import { DelayedError, Processor } from "bullmq";
import { setupContainer } from "../container";
import { ITasksDBRepository } from "../repositories/tasks";
import { K8sRepository } from "../repositories/k8s/K8sRepository";
import * as Yup from 'yup';
import { Logger } from 'pino';

const schema = Yup.object().shape({
  taskId: Yup.string().required(),
  projectId: Yup.string().required(),
  cloudProvider: Yup.string().oneOf(['gcp']).required(),
  clusterId: Yup.string().required(),
  region: Yup.string().required(),
  namespace: Yup.string().required(),
});
export type RdbExportMonitorRDBMergeJobData = Yup.InferType<typeof schema>;

const processor: Processor<RdbExportMonitorRDBMergeJobData> = async (job, token) => {

  const container = setupContainer();
    const logger = container.resolve<Logger>('logger');

  job.log(`Processing 'rdb-export-monitor-rdb-merge' job ${job.id} with data: ${JSON.stringify(job.data, null, 2)}`);

  schema.validateSync(job.data);

  const tasksRepository = container.resolve<ITasksDBRepository>(ITasksDBRepository.name);
  const k8sRepository = container.resolve<K8sRepository>(K8sRepository.name);

  try {

    const jobStatus = await k8sRepository.getJobStatus(
      job.data.projectId,
      job.data.cloudProvider,
      job.data.clusterId,
      job.data.region,
      job.data.namespace,
      job.data.taskId
    )

    if (jobStatus === 'failed') {
      throw new Error(`K8s Job ${job.data.taskId} failed`);
    }

    if (jobStatus === 'pending') {
      await job.moveToDelayed(Date.now() + 5000, token);
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
  name: 'rdb-export-monitor-rdb-merge',
  processor,
  concurrency: undefined,
  schema,
}