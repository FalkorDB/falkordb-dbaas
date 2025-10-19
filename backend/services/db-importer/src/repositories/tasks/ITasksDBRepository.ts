import { RDBExportTaskPayloadType, RDBImportTaskPayloadType, TaskDocumentType, TaskStatusType, TaskTypesType } from "@falkordb/schemas/global";

export abstract class ITasksDBRepository {

  abstract createTask(type: TaskTypesType, payload: RDBExportTaskPayloadType | RDBImportTaskPayloadType): Promise<TaskDocumentType>;

  abstract listTasks(
    instanceId: string,
    opts?: {
      page?: number,
      pageSize?: number,
      status?: TaskStatusType[],
      types?: TaskTypesType[],
    }
  ): Promise<{
    data: TaskDocumentType[];
    page: number;
    pageSize: number;
    total: number;
  }>;

  abstract updateTask(
    task: Partial<TaskDocumentType> & {
      taskId: string;
      errors?: string[];
    }
  ): Promise<TaskDocumentType>;

  abstract getTaskById(taskId: string): Promise<TaskDocumentType | null>;
}