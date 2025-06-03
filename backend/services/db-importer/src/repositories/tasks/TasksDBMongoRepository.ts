import { assert } from "console";
import { ITasksDBRepository } from "./ITasksDBRepository";
import { MongoClient } from 'mongodb';
import { TaskDocumentType, TaskDocumentSchema, RDBExportTaskPayloadType, TaskStatusType, TaskTypesType, RDBImportTaskPayloadType } from "@falkordb/schemas/global";
import { Value } from "@sinclair/typebox/value";
import { FastifyBaseLogger } from "fastify";

export class TasksDBMongoRepository implements ITasksDBRepository {

  private _client: MongoClient = null;

  private _db: string = process.env.TASKS_REPOSITORY_MONGODB_DB ?? process.env.SERVICE_NAME ?? 'db-importer-worker';

  private _collection: string = process.env.TASKS_REPOSITORY_MONGODB_COLLECTION ?? 'tasks';

  constructor(private _options: { logger: FastifyBaseLogger }) {
    assert(process.env.MONGODB_URI, 'TasksDBMongoRepository: MongoDB URI is required');
    this._client = new MongoClient(process.env.MONGODB_URI);

    this._client.connect()
      .then(() => this._options.logger.info('MongoDB connection established'))
      .then(() => this._client.db(this._db).createIndex(this._collection, 'taskId', { unique: true }))

  }

  async createTask(type: TaskTypesType, payload: RDBExportTaskPayloadType | RDBImportTaskPayloadType): Promise<TaskDocumentType> {
    this._options.logger.info({ type, payload }, 'Creating task');
    return await this._client.db(this._db).collection<TaskDocumentType>(this._collection).findOneAndUpdate({
      type,
      payload,
      status: 'created',
      taskId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, {
      $set: {},
    }, { upsert: true, returnDocument: 'after', },)
      .then((result) => Value.Cast(TaskDocumentSchema, result))
  }

  async listTasks(instanceId: string, opts: { page?: number; pageSize?: number; status?: TaskStatusType[], types?: TaskTypesType[] } = {
    page: 1,
    pageSize: 10,
  }): Promise<{ data: TaskDocumentType[]; page: number; pageSize: number; total: number; }> {
    this._options.logger.info({ instanceId, opts }, 'Listing tasks');
    const { page, pageSize } = opts;
    const skip = (page - 1) * pageSize;
    const query = {
      'payload.instanceId': instanceId,
    }
    if (opts.status) {
      query['status'] = { $in: opts.status };
    }
    if (opts.types) {
      query['type'] = { $in: opts.types };
    }
    const [total, data] = await Promise.all([
      this._client.db(this._db).collection<TaskDocumentType>(this._collection).countDocuments(query),
      this._client.db(this._db).collection<TaskDocumentType>(this._collection).find(query).sort(
        { updatedAt: -1 }
      ).skip(skip).limit(pageSize).toArray()
        .then((result) => result.map((task) => Value.Cast(TaskDocumentSchema, task)))
        .catch((err) => {
          this._options.logger.error({ err }, 'Error listing tasks');
          return [];
        })
    ]);
    return {
      data,
      page,
      pageSize,
      total,
    };
  }

  async updateTask(task: Partial<TaskDocumentType> & { taskId: string; }): Promise<TaskDocumentType> {
    this._options.logger.info({ task }, 'Updating task');
    const { taskId, ...update } = task;
    const result = await this._client.db(this._db).collection<TaskDocumentType>(this._collection).findOneAndUpdate({
      taskId,
    }, {
      $set: {
        ...update,
        updatedAt: new Date().toISOString(),
      },
    }, { returnDocument: 'after' });
    if (!result) {
      throw new Error(`Task ${taskId} not found`);
    }
    return Value.Cast(TaskDocumentSchema, result);
  }

  async getTaskById(taskId: string): Promise<TaskDocumentType | null> {
    this._options.logger.info({ taskId }, 'Getting task by ID');
    assert(taskId, 'TasksDBMongoRepository: Task ID is required');
    const task = await this._client.db(this._db).collection<TaskDocumentType>(this._collection).findOne({
      taskId,
    });
    if (!task) {
      return null;
    }
    return Value.Cast(TaskDocumentSchema, task);
  }
}