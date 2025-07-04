import { QueueEvents } from 'bullmq';
import { FlowProducer } from 'bullmq';
import { RDBTask, TaskTypes } from '../schemas/rdb-task';
import { MongoClient } from 'mongodb';
import {
  makeJobNode,
  RdbImportFlushInstanceProcessor,
  RdbImportMakeLocalBackupProcessor,
  RdbImportMonitorFormatValidationProcessor,
  RdbImportMonitorImportRDBProcessor,
  RdbImportMonitorSaveProgressProcessor,
  RdbImportMonitorSizeValidationProcessor,
  RdbImportRdbFormatValidationProcessor,
  RdbImportRdbSizeValidationProcessor,
  RdbImportRequestRdbImportProcessor,
  RdbImportSendSaveCommandProcessor,
  RdbImportValidateImportKeyNumberProcessor,
} from '../processors';

const taskId = Math.random().toString(36).substring(2, 15);
const task = {
  taskId,
  type: TaskTypes.RDBImport,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'pending',
  payload: {
    cloudProvider: 'gcp' as const,
    clusterId: 'c-hcjx5tis6bc',
    region: 'us-central1',
    instanceId: 'instance-841aeorbq',
    podIds: ['cluster-mz-0', 'cluster-mz-1', 'cluster-mz-2', 'cluster-mz-3', 'cluster-mz-4', 'cluster-mz-5'],
    hasTLS: false,
    bucketName: 'falkordb-dev-rdb-exports-f7a2434f',
    fileName: `imports/instance-841aeorbq/dump.rdb`,
    rdbSizeFileName: `imports/instance-841aeorbq/rdb-size.txt`,
    rdbKeyNumberFileName: `imports/instance-841aeorbq/key-count.txt`,
    deploymentSizeInMb: 8000,
    backupPath: '/data/backup/appendonlydir',
    aofEnabled: true,
    isCluster: true,
  },
};

let client: MongoClient;

describe('import rdb test', () => {
  beforeAll(async () => {
    client = await MongoClient.connect(process.env.MONGODB_URI ?? 'mongodb://localhost:27017');

    const db = client.db(process.env.TASKS_REPOSITORY_MONGODB_DB ?? 'db-exporter');
    const tasksCollection = db.collection(process.env.TASKS_REPOSITORY_MONGODB_COLLECTION ?? 'tasks');

    console.log('Inserting task', task);
    console.log('Task inserted:', await tasksCollection.insertOne(task));
  });

  afterAll(async () => {
    await client.close();
  });

  it('should start the rdb test', async () => {
    RDBTask.cast(task);

    const producer = new FlowProducer();

    const chain = await producer.add(
      makeJobNode(
        RdbImportValidateImportKeyNumberProcessor,
        {
          taskId,
          cloudProvider: task.payload.cloudProvider,
          clusterId: task.payload.clusterId,
          region: task.payload.region,
          instanceId: task.payload.instanceId,
          podIds: task.payload.podIds,
          hasTLS: task.payload.hasTLS,
          aofEnabled: task.payload.aofEnabled,
          backupPath: task.payload.backupPath,
          isCluster: task.payload.isCluster,
        },
        {
          failParentOnFailure: true,
        },
        [
          makeJobNode(
            RdbImportMonitorImportRDBProcessor,
            {
              taskId,
              cloudProvider: task.payload.cloudProvider,
              clusterId: task.payload.clusterId,
              region: task.payload.region,
              podIds: task.payload.podIds,
              aofEnabled: task.payload.aofEnabled,
              backupPath: task.payload.backupPath,
              namespace: task.payload.instanceId,
              projectId: process.env.APPLICATION_PLANE_PROJECT_ID,
            },
            {
              failParentOnFailure: true,
            },
            [
              makeJobNode(
                RdbImportRequestRdbImportProcessor,
                {
                  taskId,
                  cloudProvider: task.payload.cloudProvider,
                  clusterId: task.payload.clusterId,
                  region: task.payload.region,
                  projectId: process.env.APPLICATION_PLANE_PROJECT_ID,
                  bucketName: task.payload.bucketName,
                  fileName: task.payload.fileName,
                  hasTLS: task.payload.hasTLS,
                  instanceId: task.payload.instanceId,
                  podId: task.payload.podIds[0],
                },
                {
                  failParentOnFailure: true,
                },
                [
                  makeJobNode(
                    RdbImportFlushInstanceProcessor,
                    {
                      taskId,
                      cloudProvider: task.payload.cloudProvider,
                      clusterId: task.payload.clusterId,
                      region: task.payload.region,
                      instanceId: task.payload.instanceId,
                      podIds: task.payload.podIds,
                      hasTLS: task.payload.hasTLS,
                      isCluster: task.payload.isCluster,
                      aofEnabled: task.payload.aofEnabled,
                    },
                    {
                      failParentOnFailure: true,
                    },
                    [
                      makeJobNode(
                        RdbImportMakeLocalBackupProcessor,
                        {
                          taskId,
                          cloudProvider: task.payload.cloudProvider,
                          clusterId: task.payload.clusterId,
                          region: task.payload.region,
                          instanceId: task.payload.instanceId,
                          podIds: task.payload.podIds,
                          aofEnabled: task.payload.aofEnabled,
                          backupPath: task.payload.backupPath,
                        },
                        {
                          failParentOnFailure: true,
                        },
                        [
                          makeJobNode(
                            RdbImportMonitorSaveProgressProcessor,
                            {
                              taskId,
                              cloudProvider: task.payload.cloudProvider,
                              clusterId: task.payload.clusterId,
                              region: task.payload.region,
                              instanceId: task.payload.instanceId,
                              podIds: task.payload.podIds,
                              aofEnabled: task.payload.aofEnabled,
                              hasTLS: task.payload.hasTLS,
                            },
                            {
                              failParentOnFailure: true,
                            },
                            [
                              makeJobNode(
                                RdbImportSendSaveCommandProcessor,
                                {
                                  taskId,
                                  cloudProvider: task.payload.cloudProvider,
                                  clusterId: task.payload.clusterId,
                                  region: task.payload.region,
                                  instanceId: task.payload.instanceId,
                                  podIds: task.payload.podIds,
                                  hasTLS: task.payload.hasTLS,
                                  aofEnabled: task.payload.aofEnabled,
                                },
                                {
                                  failParentOnFailure: true,
                                },
                                [
                                  makeJobNode(
                                    RdbImportMonitorFormatValidationProcessor,
                                    {
                                      taskId: task.taskId,
                                      cloudProvider: task.payload.cloudProvider,
                                      clusterId: process.env.CTRL_PLANE_CLUSTER_ID,
                                      region: process.env.CTRL_PLANE_REGION,
                                      namespace: process.env.NAMESPACE,
                                      bucketName: task.payload.bucketName,
                                      jobResultFileName: task.payload.rdbKeyNumberFileName,
                                      projectId: process.env.CTRL_PLANE_PROJECT_ID,
                                    },
                                    {
                                      failParentOnFailure: true,
                                    },
                                    [
                                      makeJobNode(
                                        RdbImportRdbFormatValidationProcessor,
                                        {
                                          taskId: task.taskId,
                                          cloudProvider: task.payload.cloudProvider,
                                          clusterId: process.env.CTRL_PLANE_CLUSTER_ID,
                                          region: process.env.CTRL_PLANE_REGION,
                                          namespace: process.env.NAMESPACE,
                                          bucketName: task.payload.bucketName,
                                          jobResultFileName: task.payload.rdbKeyNumberFileName,
                                          fileName: task.payload.fileName,
                                          projectId: process.env.CTRL_PLANE_PROJECT_ID,
                                        },
                                        {
                                          failParentOnFailure: true,
                                        },
                                      ),
                                    ],
                                  ),
                                  makeJobNode(
                                    RdbImportMonitorSizeValidationProcessor,
                                    {
                                      taskId: task.taskId,
                                      cloudProvider: task.payload.cloudProvider,
                                      clusterId: process.env.CTRL_PLANE_CLUSTER_ID,
                                      region: process.env.CTRL_PLANE_REGION,
                                      namespace: process.env.NAMESPACE,
                                      bucketName: task.payload.bucketName,
                                      jobResultFileName: task.payload.rdbSizeFileName,
                                      maxRdbSize: task.payload.deploymentSizeInMb,
                                      projectId: process.env.CTRL_PLANE_PROJECT_ID,
                                    },
                                    {
                                      failParentOnFailure: true,
                                    },
                                    [
                                      makeJobNode(
                                        RdbImportRdbSizeValidationProcessor,
                                        {
                                          taskId: task.taskId,
                                          cloudProvider: task.payload.cloudProvider,
                                          clusterId: process.env.CTRL_PLANE_CLUSTER_ID,
                                          region: process.env.CTRL_PLANE_REGION,
                                          namespace: process.env.NAMESPACE,
                                          bucketName: task.payload.bucketName,
                                          jobResultFileName: task.payload.rdbSizeFileName,
                                          fileName: task.payload.fileName,
                                          projectId: process.env.CTRL_PLANE_PROJECT_ID,
                                        },
                                        {
                                          failParentOnFailure: true,
                                        },
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );

    // Wait for the job to complete
    const queue = new QueueEvents(RdbImportValidateImportKeyNumberProcessor.name);
    await chain.job.waitUntilFinished(queue);

    const state = await chain.job.getState();
    console.log('Job completed:', state);
    expect(state === 'completed').toBe(true);
  }, 120000);
});
