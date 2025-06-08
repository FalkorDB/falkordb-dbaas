import { ExportRDBTaskType, ImportRDBTaskType } from "@falkordb/schemas/global";

export abstract class ITaskQueueRepository {
  abstract submitExportRDBTask(
    task: ExportRDBTaskType,
  ): Promise<void>;

  abstract submitImportRDBTask(
    task: ImportRDBTaskType,
  ): Promise<void>;
}