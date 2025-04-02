import { type Static, Type } from '@sinclair/typebox';

export const ExportRDBRequestBodySchema = Type.Object({
  instanceId: Type.String(),
  username: Type.Optional(Type.String()),
  password: Type.Optional(Type.String()),
});

export type ExportRDBRequestBody = Static<typeof ExportRDBRequestBodySchema>;
