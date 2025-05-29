import { Type, type Static } from '@sinclair/typebox';
import { ExportRDBTaskSchema } from '../../../../global/rdb-task';

/****** List export rdb task *****/

export const ListExportRDBTasksRequestQuerySchema = Type.Object({
  instanceId: Type.String(),
  page: Type.Integer({
    minimum: 1,
    default: 1,
  }),
  pageSize: Type.Integer({
    default: 10,
  }),
});

export type ListExportRDBTasksRequestQueryType = Static<typeof ListExportRDBTasksRequestQuerySchema>;

export const ListExportRDBTasksResponseSchema = Type.Object({
  data: Type.Array(ExportRDBTaskSchema),
  page: Type.Integer(),
  pageSize: Type.Integer(),
  total: Type.Integer(),
});

export type ListExportRDBTasksResponseType = Static<typeof ListExportRDBTasksResponseSchema>;
