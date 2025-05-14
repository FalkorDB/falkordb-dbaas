import { ExportRDBTaskType, RDBExportTaskPayloadType, TaskStatusType, TaskTypesType } from "@falkordb/schemas/global";

export abstract class ITasksDBRepository {

  abstract createTask(type: TaskTypesType, payload: RDBExportTaskPayloadType): Promise<ExportRDBTaskType>;

  abstract listTasks(
    instanceId: string,
    opts?: {
      page?: number,
      pageSize?: number,
      status?: TaskStatusType[],
    }
  ): Promise<{
    data: ExportRDBTaskType[];
    page: number;
    pageSize: number;
    total: number;
  }>;

  abstract updateTask(
    task: Partial<ExportRDBTaskType> & {
      taskId: string;
    }
  ): Promise<ExportRDBTaskType>;
}