import { type Static, Type } from '@sinclair/typebox';

export const RequestHeaderSchema = Type.Object({
  userId: Type.String(),
  organizationId: Type.String(),
});

export type RequestHeaderSchemaType = Static<typeof RequestHeaderSchema>;
