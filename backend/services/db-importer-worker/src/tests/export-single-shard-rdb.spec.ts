import { Queue, QueueEvents } from 'bullmq';
import { FlowProducer } from 'bullmq';
import { TasksDBMongoRepository } from '../repositories/tasks';
import { RDBTask, RDBTaskType, TaskTypes } from '../schemas/rdb-task';
import { MongoClient } from 'mongodb';
import {
  makeJobNode,
  RdbExportCopyRDBToBucketProcessor,
  RdbExportMonitorSaveProgressProcessor,
  RdbExportRequestReadSignedURLProcessor,
  RdbExportSendSaveCommandProcessor,
} from '../processors'

const taskId = Math.random().toString(36).substring(2, 15);
const task = {
  taskId,
  type: TaskTypes.SingleShardRDBExport,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'pending',
  payload: {
    cloudProvider: 'gcp' as const,
    clusterId: 'c-hcjx5tis6bc',
    region: 'us-central1',
    instanceId: 'instance-n90jl2ndq',
    podId: 'node-f-0',
    hasTLS: false,
    destination: {
      bucketName: 'falkordb-dev-rdb-exports-f7a2434f',
      fileName: `exports/export_instance-n90jl2ndq_${taskId}.rdb`,
      expiresIn: 7 * 24 * 60 * 60 * 1000,
    },
  },
}

let client: MongoClient;



describe('export single shard rdb test', () => {

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

    RDBTask.cast(task);

    const producer = new FlowProducer();

    const chain = await producer.add(
      makeJobNode(
        RdbExportCopyRDBToBucketProcessor,
        {
          taskId: task.taskId,
          cloudProvider: task.payload.cloudProvider,
          clusterId: task.payload.clusterId,
          region: task.payload.region,
          instanceId: task.payload.instanceId,
          podId: task.payload.podId,
          bucketName: task.payload.destination.bucketName,
          fileName: task.payload.destination.fileName,
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
              fileName: task.payload.destination.fileName,
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
                  podId: task.payload.podId,
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
                      podId: task.payload.podId,
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
    );

    // Wait for the job to complete
    const queue = new QueueEvents(RdbExportCopyRDBToBucketProcessor.name);
    await chain.job.waitUntilFinished(queue);

    const state = await chain.job.getState();
    console.log('Job completed:', state);
    expect(state === 'completed').toBe(true);

  }, 60000)

});
