import { type Static, Type } from '@sinclair/typebox';

export const OmnistrateInstanceSchema = Type.Object({
  id: Type.String(),
});

export type OmnistrateInstanceSchemaType = Static<typeof OmnistrateInstanceSchema>;
