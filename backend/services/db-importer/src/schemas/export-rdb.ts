import { type Static, Type } from '@sinclair/typebox';

export const ExportRDBRequestBodySchema = Type.Object({
  sourceUri: Type.String(),
});

export type ExportRDBRequestBody = Static<typeof ExportRDBRequestBodySchema>;
