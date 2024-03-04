import { type Static, Type } from '@sinclair/typebox';

export const CloudBuildOperationsCallbackBodySchema = Type.Object({
  status: Type.Union([
    Type.Literal('STATUS_UNKNOWN'),
    Type.Literal('PENDING'),
    Type.Literal('QUEUED'),
    Type.Literal('WORKING'),
    Type.Literal('SUCCESS'),
    Type.Literal('FAILURE'),
    Type.Literal('INTERNAL_ERROR'),
    Type.Literal('TIMEOUT'),
    Type.Literal('CANCELLED'),
    Type.Literal('EXPIRED'),
  ]),
  startTime: Type.String({
    format: 'date-time',
  }),
  finishTime: Type.Optional(Type.String({
    format: 'date-time',
  })),
  tags: Type.Array(Type.String()),
});

export type CloudBuildOperationsCallbackBodySchemaType = Static<typeof CloudBuildOperationsCallbackBodySchema>;
