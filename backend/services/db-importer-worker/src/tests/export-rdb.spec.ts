import { Queue } from 'bullmq';
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
      bucketName: 'falkordb_rdbs_test_eu',
      fileName: 'exports/export_instance-n90jl2ndq.rdb',
      expiresIn: 3600,
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

    while (!(await chain.job.isCompleted()) && !(await chain.job.isFailed())) {
      console.log('Job is in progress...', await chain.job.getState());
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log('Job completed:', chain.job.returnvalue);
    expect(chain.job.returnvalue).not.toBeNull();

  })

});
