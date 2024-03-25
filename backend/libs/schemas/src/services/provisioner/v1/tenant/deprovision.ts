import { type Static, Type } from '@sinclair/typebox';
import { CreateOperationParamsSchema } from '../../../../global';

export const TenantDeprovisionParamsSchema = Type.Object({
  id: Type.String(),
});

export type TenantDeprovisionParamsSchemaType = Static<typeof TenantDeprovisionParamsSchema>;

export const TenantDeprovisionResponseSchema = CreateOperationParamsSchema;

export type TenantDeprovisionResponseSchemaType = Static<typeof TenantDeprovisionResponseSchema>;
