import { type Static, Type } from '@sinclair/typebox';

export const RoleSchema = Type.Union([Type.Literal('owner'), Type.Literal('writer'), Type.Literal('reader')]);

export type RoleType = Static<typeof RoleSchema>;