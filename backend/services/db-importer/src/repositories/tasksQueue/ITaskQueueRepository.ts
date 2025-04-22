import { ExportRDBTaskType } from "@falkordb/schemas/src/global";

export abstract class ITaskQueueRepository {
  abstract submitTask(
    task: ExportRDBTaskType,
  ): Promise<void>;
}