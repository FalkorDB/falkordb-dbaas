import { type Static, Type } from '@sinclair/typebox';

export const TierIdSchema = Type.Union([
  Type.Literal('m0'),
  Type.Literal('m1'),
  Type.Literal('m2'),
  Type.Literal('m4'),
  Type.Literal('m8'),
  Type.Literal('m16'),
  Type.Literal('m32'),
]);

export type TierIdSchemaType = Static<typeof TierIdSchema>;
