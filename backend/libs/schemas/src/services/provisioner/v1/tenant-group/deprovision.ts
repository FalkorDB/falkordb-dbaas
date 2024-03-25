import { type Static, Type } from '@sinclair/typebox';
import { CreateOperationParamsSchema } from '../../../../global';

export const TenantGroupDeprovisionParamsSchema = Type.Object({
  id: Type.String(),
});

export type TenantGroupDeprovisionParamsSchemaType = Static<typeof TenantGroupDeprovisionParamsSchema>;

export const TenantGroupDeprovisionResponseSchema = CreateOperationParamsSchema;

export type TenantGroupDeprovisionResponseSchemaType = Static<typeof TenantGroupDeprovisionResponseSchema>;
