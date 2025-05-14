import { ExportRDBTaskType } from "@falkordb/schemas/global";

export abstract class ITaskQueueRepository {
  abstract submitTask(
    task: ExportRDBTaskType,
  ): Promise<void>;
}