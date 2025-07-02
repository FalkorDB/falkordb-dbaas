import { RDBTaskType } from "../../schemas/rdb-task";

export abstract class ITasksDBRepository {

  abstract getTaskById(taskId: string): Promise<RDBTaskType>;

  abstract updateTask(task: RDBTaskType): Promise<void>;

}