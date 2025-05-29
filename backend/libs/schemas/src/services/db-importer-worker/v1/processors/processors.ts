import { RdbExportSchemaMap } from './rdb-export';
import { RdbImportSchemaMap } from './rdb-import';

export * from './rdb-export';
export * from './rdb-import';


export const ProcessorsSchemaMap = {
  ...RdbExportSchemaMap,
  ...RdbImportSchemaMap,
}
