import { assert } from "console";
import { ITasksDBRepository } from "./ITasksDBRepository";
import { MongoClient } from 'mongodb';
import { RDBTask, RDBTaskType } from "../../schemas/rdb-task";
import { Logger } from "pino";
import { flatten } from "../../utils/flatten";

export class TasksDBMongoRepository implements ITasksDBRepository {

  private _client: MongoClient = null;

  private _db: string = process.env.TASKS_REPOSITORY_MONGODB_DB ?? process.env.SERVICE_NAME ?? 'db-importer-worker';

  private _collection: string = process.env.TASKS_REPOSITORY_MONGODB_COLLECTION ?? 'tasks';

  constructor(private _options: { logger: Logger }) {
    assert(process.env.MONGODB_URI, 'TasksDBMongoRepository: MongoDB URI is required');
    this._client = new MongoClient(process.env.MONGODB_URI);

    this._client.connect()
      .then(() => this._options.logger.info('MongoDB connection established'))
      .then(() => this._client.db(this._db).createIndex(this._collection, 'taskId', { unique: true }))

  }

  async getTaskById(taskId: string) {
    const db = this._client.db(this._db);
    const task = await db.collection(this._collection).findOne({ taskId });
    this._options.logger.info({ taskId, task }, 'getTaskById');
    if (!task) {
      return null;
    }
    return RDBTask.validateSync(task) as RDBTaskType;
  }

  async updateTask(task: RDBTaskType) {
    const db = this._client.db(this._db);
    task.updatedAt = new Date().toISOString();
    await db.collection(this._collection).updateOne({ taskId: task.taskId }, { $set: flatten(task) });
  }

}