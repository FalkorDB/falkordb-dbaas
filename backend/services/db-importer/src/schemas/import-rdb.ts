import { type Static, Type } from '@sinclair/typebox';

export const ImportRDBRequestBodySchema = Type.Object({
  sourceUri: Type.String(),
  destinationUri: Type.String(),
});

export type ImportRDBRequestBody = Static<typeof ImportRDBRequestBodySchema>;
