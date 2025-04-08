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
  bucketName: Yup.string().required(),
  rdbFileNames: Yup.array().of(Yup.string()).required(),
  outputRdbFileName: Yup.string().required(),
});
export type RdbExportRequestRDBMergeJobData = Yup.InferType<typeof schema>;

const processor: Processor<RdbExportRequestRDBMergeJobData> = async (job, token) => {

  const container = setupContainer();
  const logger = container.resolve<Logger>('logger');

  job.log(`Processing 'rdb-export-request-rdb-merge' job ${job.id} with data: ${JSON.stringify(job.data, null, 2)}`);

  schema.validateSync(job.data);

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
  name: 'rdb-export-request-rdb-merge',
  processor,
  concurrency: undefined,
  schema,
}