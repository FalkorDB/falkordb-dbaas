import { ExportRDBTaskType } from "../../schemas/export-rdb-task";

export abstract class ITasksDBRepository {

  abstract getTaskById(taskId: string): Promise<ExportRDBTaskType>;

  abstract updateTask(task: ExportRDBTaskType): Promise<void>;

}