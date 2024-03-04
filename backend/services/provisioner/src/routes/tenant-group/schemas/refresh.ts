import { type Static, Type } from '@sinclair/typebox';
import { CreateOperationParamsSchema } from '../../../schemas/operation';

export const TenantGroupRefreshParamsSchema = Type.Object({
  id: Type.String(),
});

export type TenantGroupRefreshParamsSchemaType = Static<typeof TenantGroupRefreshParamsSchema>;

export const TenantGroupRefreshResponseSchema = CreateOperationParamsSchema;

export type TenantGroupRefreshResponseSchemaType = Static<typeof TenantGroupRefreshResponseSchema>;
