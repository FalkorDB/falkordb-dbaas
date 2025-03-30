import { type Static, Type } from '@sinclair/typebox';

export const GetOmnistrateTokenHeadersSchema = Type.Object({
  authorization: Type.String(),
});

export type GetOmnistrateTokenHeadersSchemaType = Static<typeof GetOmnistrateTokenHeadersSchema>;
