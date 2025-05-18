import { FlowJob, Queue, QueueEvents } from 'bullmq';
import { FlowProducer } from 'bullmq';
import { MongoClient } from 'mongodb';
import {
  RdbExportCopyRDBToBucketProcessor,
  RdbExportMonitorSaveProgressProcessor,
  RdbExportRequestReadSignedURLProcessor,
  RdbExportSendSaveCommandProcessor,
  RdbExportMonitorRDBMergeProcessor,
  RdbExportRequestRDBMergeProcessor,
  makeJobNode
} from '../processors';
import { ExportRDBTask, TaskTypes } from '../schemas/export-rdb-task';

const taskId = Math.random().toString(36).substring(2, 15);
const task = {
  taskId,
  type: TaskTypes.MultiShardRDBExport,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'pending',
  payload: {
    cloudProvider: 'gcp' as const,
    clusterId: 'c-hcjx5tis6bc',
    region: 'us-central1',
    instanceId: 'instance-841aeorbq',
    hasTLS: false,
    destination: {
      bucketName: 'falkordb-dev-rdb-exports-f7a2434f',
      fileName: `exports/export_instance-841aeorbq_${taskId}.rdb`,
      expiresIn: 7 * 24 * 60 * 60 * 1000,
    },
    nodes: [
      {
        podId: 'cluster-mz-0',
        partFileName: `exports/parts/export_instance-841aeorbq_${taskId}_part_cluster-mz-0.rdb`,
      },
      {
        podId: 'cluster-mz-2',
        partFileName: `exports/parts/export_instance-841aeorbq_${taskId}_part_cluster-mz-2.rdb`,
      },
      {
        podId: 'cluster-mz-4',
        partFileName: `exports/parts/export_instance-841aeorbq_${taskId}_part_cluster-mz-4.rdb`,
      },
    ],
  },
}

let client: MongoClient;

const _makePodJob = (node: { podId: string, partFileName: string }): FlowJob => {
  return makeJobNode(
    RdbExportCopyRDBToBucketProcessor,
    {
      taskId: task.taskId,
      cloudProvider: task.payload.cloudProvider,
      clusterId: task.payload.clusterId,
      region: task.payload.region,
      instanceId: task.payload.instanceId,
      podId: node.podId,
      bucketName: task.payload.destination.bucketName,
      fileName: node.partFileName,
    },
    {
      failParentOnFailure: true,
    },
    [
      makeJobNode(
        RdbExportRequestReadSignedURLProcessor,
        {
          taskId: task.taskId,
          bucketName: task.payload.destination.bucketName,
          fileName: node.partFileName,
          expiresIn: task.payload.destination.expiresIn,
        },
        {
          failParentOnFailure: true,
        },
        [
          makeJobNode(
            RdbExportMonitorSaveProgressProcessor,
            {
              taskId: task.taskId,
              podId: node.podId,
              cloudProvider: task.payload.cloudProvider,
              clusterId: task.payload.clusterId,
              region: task.payload.region,
              instanceId: task.payload.instanceId,
              hasTLS: task.payload.hasTLS,
            },
            {
              failParentOnFailure: true,
            },
            [
              makeJobNode(
                RdbExportSendSaveCommandProcessor,
                {
                  taskId: task.taskId,
                  podId: node.podId,
                  cloudProvider: task.payload.cloudProvider,
                  clusterId: task.payload.clusterId,
                  region: task.payload.region,
                  instanceId: task.payload.instanceId,
                  hasTLS: task.payload.hasTLS,
                },
                {
                  failParentOnFailure: true,
                }
              )
            ]
          )
        ]
      )
    ]
  )
}

describe('export multi shard rdb test', () => {

  beforeAll(async () => {

    client = await MongoClient.connect(process.env.MONGODB_URI ?? 'mongodb://localhost:27017');

    const db = client.db(process.env.TASKS_REPOSITORY_MONGODB_DB ?? 'db-exporter');
    const tasksCollection = db.collection(process.env.TASKS_REPOSITORY_MONGODB_COLLECTION ?? 'tasks')

    console.log('Inserting task', task);
    console.log('Task inserted:', await tasksCollection.insertOne(task));
  })

  afterAll(async () => {
    await client.close();
  })

  it('should start the rdb test', async () => {

    ExportRDBTask.cast(task);

    const producer = new FlowProducer();

    const chain = await producer.add(
      makeJobNode(
        RdbExportRequestReadSignedURLProcessor,
        {
          taskId,
          bucketName: task.payload.destination.bucketName,
          fileName: task.payload.destination.fileName,
          expiresIn: task.payload.destination.expiresIn,
        },
        {
          failParentOnFailure: true,
        },
        [
          makeJobNode(
            RdbExportMonitorRDBMergeProcessor,
            {
              taskId: task.taskId,
              cloudProvider: 'gcp',
              projectId: process.env.CTRL_PLANE_PROJECT_ID,
              clusterId: process.env.CTRL_PLANE_CLUSTER_ID,
              region: process.env.CTRL_PLANE_REGION,
              namespace: process.env.NAMESPACE,
            },
            {
              failParentOnFailure: true
            },
            [
              makeJobNode(
                RdbExportRequestRDBMergeProcessor,
                {
                  taskId: task.taskId,
                  cloudProvider: 'gcp',
                  projectId: process.env.CTRL_PLANE_PROJECT_ID,
                  clusterId: process.env.CTRL_PLANE_CLUSTER_ID,
                  region: process.env.CTRL_PLANE_REGION,
                  namespace: process.env.NAMESPACE,
                  bucketName: task.payload.destination.bucketName,
                  outputRdbFileName: task.payload.destination.fileName,
                  rdbFileNames: task.payload.nodes.map(node => node.partFileName),
                },
                { failParentOnFailure: true },
                task.payload.nodes.map(node => _makePodJob(node)),
              )
            ]
          )
        ]
      )
    );

    // Wait for the job to complete
    const queue = new QueueEvents(RdbExportRequestReadSignedURLProcessor.name);
    await chain.job.waitUntilFinished(queue);

    const state = await chain.job.getState();
    console.log('Job completed:', state);
    expect(state === 'completed').toBe(true);

  }, 60000)

});
