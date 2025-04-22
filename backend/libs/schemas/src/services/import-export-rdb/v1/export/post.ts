import { type Static, Type } from '@sinclair/typebox';

export const ExportRDBRequestBodySchema = Type.Object({
  instanceId: Type.String(),
  username: Type.Optional(Type.String()),
  password: Type.Optional(Type.String()),
  "g-recaptcha-response": Type.Optional(Type.String()),
});

export type ExportRDBRequestBody = Static<typeof ExportRDBRequestBodySchema>;

export const ExportRDBResponseBodySchema = Type.Object({
  taskId: Type.String(),
});
export type ExportRDBResponseBody = Static<typeof ExportRDBResponseBodySchema>;