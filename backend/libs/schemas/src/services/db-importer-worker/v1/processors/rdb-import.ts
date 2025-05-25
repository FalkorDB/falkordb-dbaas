import { type Static, Type } from '@sinclair/typebox';

export const RdbImportValidateRDBFileProcessorDataSchema = Type.Object({
  taskId: Type.String(),
  bucketName: Type.String(),
  fileName: Type.String(),
});
export type RdbImportValidateRDBFileProcessorData = Static<typeof RdbImportValidateRDBFileProcessorDataSchema>;

export enum RdbImportTaskNames {
  RdbImportValidateRDBFile = 'rdb-import-validate-rdb-file',
}

export const RdbImportSchemaMap = {
  [RdbImportTaskNames.RdbImportValidateRDBFile]: RdbImportValidateRDBFileProcessorDataSchema,
} as const;