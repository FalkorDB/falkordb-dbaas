import { Queue, QueueEvents } from 'bullmq';
import { FlowProducer } from 'bullmq';
import { TasksDBMongoRepository } from '../repositories/tasks';
import { ExportRDBTaskType } from '../schemas/export-rdb-task';
import { MongoClient } from 'mongodb';

const task: ExportRDBTaskType = {
  taskId: Math.random().toString(36).substring(2, 15),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'pending',
  payload: {
    source: {
      cloudProvider: 'gcp',
      clusterId: 'hcjx5tis6bc',
      region: 'us-central1',
      instanceId: 'instance-n90jl2ndq',
      podId: 'node-f-0',
      hasTLS: false,
    },
    destination: {
      bucketName: 'falkordb-dev-rdb-exports-f7a2434f',
      fileName: 'exports/export_instance-n90jl2ndq.rdb',
      expiresIn: 7 * 24 * 60 * 60 * 1000,
    },
  },
}

let client: MongoClient;



describe('export rdb test', () => {

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

    const producer = new FlowProducer();

    const data = {
      taskId: task.taskId,
    }

    const chain = await producer.add({
      name: 'rdb-export-copy-rdb-to-bucket',
      queueName: 'rdb-export-copy-rdb-to-bucket',
      opts: {
        failParentOnFailure: true,
      },
      data,
      children: [
        {
          name: 'rdb-export-monitor-save-progress',
          queueName: 'rdb-export-monitor-save-progress',
          opts: {
            failParentOnFailure: true,
          },
          data,
          children: [
            {
              name: 'rdb-export-send-save-command',
              queueName: 'rdb-export-send-save-command',
              opts: {
                failParentOnFailure: true,
              },
              data,
              children: [
                {
                  name: 'rdb-export-request-signed-url',
                  queueName: 'rdb-export-request-signed-url',
                  opts: {
                    failParentOnFailure: true,
                  },
                  data,
                }
              ]
            }
          ]
        }
      ]
    });

    // Wait for the job to complete
    const queue = new QueueEvents('rdb-export-copy-rdb-to-bucket');
    await chain.job.waitUntilFinished(queue);

    const state = await chain.job.getState();
    console.log('Job completed:', state);
    expect(state === 'completed').toBe(true);

  }, 60000)

});
