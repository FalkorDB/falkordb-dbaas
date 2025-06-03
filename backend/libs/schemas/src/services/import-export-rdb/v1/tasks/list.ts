import { Type, type Static } from '@sinclair/typebox';
import { TaskDocumentSchema } from '../../../../global/rdb-task';

/****** List rdb task *****/

export const ListRDBTasksRequestQuerySchema = Type.Object({
  instanceId: Type.String(),
  page: Type.Integer({
    minimum: 1,
    default: 1,
  }),
  pageSize: Type.Integer({
    default: 10,
  }),
});

export type ListRDBTasksRequestQueryType = Static<typeof ListRDBTasksRequestQuerySchema>;

export const ListRDBTasksResponseSchema = Type.Object({
  data: Type.Array(TaskDocumentSchema),
  page: Type.Integer(),
  pageSize: Type.Integer(),
  total: Type.Integer(),
});

export type ListRDBTasksResponseType = Static<typeof ListRDBTasksResponseSchema>;
